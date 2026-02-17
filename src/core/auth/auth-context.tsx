import {
  SignupInput,
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
import { dataSource } from "@/core/data/data-source";
import { getErrorMessage } from "@/core/http/http-error";
import { AuthSession } from "@/features/auth/domain/auth.types";
import { demoUsers } from "@/mocks/demo-data";

type AuthContextValue = {
  session: AuthSession | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (input: SignupInput) => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
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
          if (dataSource.useDemoData && token === DEMO_ACCESS_TOKEN) {
            setSession(createDemoSession());
          } else {
            const now = new Date().toISOString();
            setSession({
              accessToken: token,
              user: {
                id: "cached",
                email: "cached@local",
                username: "cached",
                role: "user",
                isActive: true,
                createdAt: now,
                updatedAt: now,
              },
            });
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
      loginWithDemoAccount: handleDemoLogin,
      logout: handleLogout,
    }),
    [session, isLoading, error, isBootstrapped],
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
