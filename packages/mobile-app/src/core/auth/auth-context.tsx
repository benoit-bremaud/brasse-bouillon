import { HttpError, getErrorMessage } from "@/core/http/http-error";
import {
  SignupInput,
  getCurrentUser,
  login,
  requestPasswordReset,
  signup,
} from "@/features/auth/data/auth.api";
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { authSession } from "@/core/auth/session";
import { env } from "@/core/config/env";
import { dataSource } from "@/core/data/data-source";
import { AuthSession } from "@/features/auth/domain/auth.types";
import { isDemoTriggerCredentials } from "@/features/auth/domain/demo-trigger-credentials";
import { demoUsers } from "@/mocks/demo-data";

type AuthContextValue = {
  session: AuthSession | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (input: SignupInput) => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
  loginWithDemoAccount: () => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const DEMO_ACCESS_TOKEN = "demo-access-token";

function createDemoSession(): AuthSession {
  const fallbackNow = new Date().toISOString();
  const user = demoUsers[0];

  return {
    accessToken: DEMO_ACCESS_TOKEN,
    user: {
      id: user?.id ?? "u-demo-local",
      email: user?.email ?? "demo@brasse-bouillon.local",
      username: user?.username ?? "demo",
      firstName: user?.firstName,
      lastName: user?.lastName,
      role: user?.role ?? "user",
      isActive: user?.isActive ?? true,
      createdAt: user?.createdAt ?? fallbackNow,
      updatedAt: user?.updatedAt ?? fallbackNow,
    },
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isBootstrapped, setIsBootstrapped] = useState(false);

  useEffect(() => {
    const loadSession = async () => {
      try {
        setIsLoading(true);
        const token = await authSession.load();
        if (token) {
          // A stored DEMO_ACCESS_TOKEN means the previous session was
          // created via the demo trigger credentials. Honour it without
          // hitting the backend — and re-arm `dataSource.useDemoData`
          // since the runtime toggle resets to its boot-time value on
          // every app reload. Without this, a demo session restored
          // after a reload would block the sign-in screen behind an
          // HTTP timeout against a backend that may not even be
          // reachable (soutenance / offline demos).
          if (token === DEMO_ACCESS_TOKEN) {
            dataSource.useDemoData = true;
            setSession(createDemoSession());
          } else {
            try {
              const currentUser = await getCurrentUser();
              setSession({
                accessToken: token,
                user: currentUser,
              });
            } catch (error) {
              if (error instanceof HttpError && error.status === 401) {
                await authSession.clear();
                setSession(null);
              } else {
                throw error;
              }
            }
          }
        }
      } catch (err) {
        setError(getErrorMessage(err, "Failed to restore session"));
      } finally {
        setIsLoading(false);
        setIsBootstrapped(true);
      }
    };

    loadSession();
  }, []);

  const handleLogin = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      // Issue #822 — soutenance safety net. If the speaker types
      // the demo trigger credentials, flip the runtime data-source
      // toggle into demo mode and emit a synthetic session without
      // touching the network. Anyone observing the source can read
      // the trigger pair, but the demo data is curated public mocks
      // — no privilege escalation.
      if (isDemoTriggerCredentials(email, password)) {
        dataSource.useDemoData = true;
        const demoSession = createDemoSession();
        await authSession.setAccessToken(demoSession.accessToken);
        setSession(demoSession);
        return;
      }

      const nextSession = await login(email, password);
      await authSession.setAccessToken(nextSession.accessToken);
      setSession(nextSession);
    } catch (err) {
      const message = getErrorMessage(err, "Login failed");
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (input: SignupInput) => {
    setIsLoading(true);
    setError(null);
    try {
      const nextSession = await signup(input);
      await authSession.setAccessToken(nextSession.accessToken);
      setSession(nextSession);
    } catch (err) {
      const message = getErrorMessage(err, "Signup failed");
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestPasswordReset = async (email: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await requestPasswordReset(email);
    } catch (err) {
      const message = getErrorMessage(err, "Password reset failed");
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefreshProfile = async () => {
    if (!session?.accessToken) {
      return;
    }

    if (dataSource.useDemoData && session.accessToken === DEMO_ACCESS_TOKEN) {
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const currentUser = await getCurrentUser();
      setSession({
        accessToken: session.accessToken,
        user: currentUser,
      });
    } catch (err) {
      if (err instanceof HttpError && err.status === 401) {
        await authSession.clear();
        setSession(null);
      }

      const message = getErrorMessage(err, "Failed to refresh profile");
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (!dataSource.useDemoData) {
        throw new Error(
          "La connexion démo est disponible uniquement en mode démo (EXPO_PUBLIC_USE_DEMO_DATA=true).",
        );
      }

      const demoSession = createDemoSession();
      await authSession.setAccessToken(demoSession.accessToken);
      setSession(demoSession);
    } catch (err) {
      const message = getErrorMessage(err, "Demo login failed");
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    // Issue #822 — when demo mode was activated mid-session via
    // the trigger credentials, restore the original boot-time
    // toggle so the next login attempt hits the real backend
    // again. If demo mode was already on at boot (build-time env
    // var), leave the flag alone.
    if (dataSource.useDemoData && !env.useDemoData) {
      dataSource.useDemoData = false;
    }
    await authSession.clear();
    setSession(null);
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      session: isBootstrapped ? session : null,
      isLoading,
      error,
      login: handleLogin,
      signup: handleSignup,
      requestPasswordReset: handleRequestPasswordReset,
      refreshProfile: handleRefreshProfile,
      loginWithDemoAccount: handleDemoLogin,
      logout: handleLogout,
    }),
    [
      session,
      isLoading,
      error,
      isBootstrapped,
      handleRefreshProfile,
      handleRequestPasswordReset,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return ctx;
}
