import { HttpError, getErrorMessage } from "@/core/http/http-error";
import {
  ChangePasswordInput,
  AccountDeletionSchedule,
  cancelCurrentUserDeletion,
  deleteCurrentUser,
  SignupInput,
  UpdateProfileInput,
  changeCurrentUserPassword,
  getCurrentUser,
  login,
  requestPasswordReset,
  requestCurrentUserDeletion,
  signup,
  updateCurrentUser,
} from "@/features/auth/data/auth.api";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { authSession } from "@/core/auth/session";
import { env } from "@/core/config/env";
import { dataSource } from "@/core/data/data-source";
import { purgeAccountPreferences } from "@/features/profile/application/account-preferences.use-cases";
import { purgeLabelDrafts } from "@/features/labels/application/labels.use-cases";
import { purgeScanLocalData } from "@/features/scan/application/scan.use-cases";
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
  requestAccountDeletion: () => Promise<AccountDeletionSchedule>;
  cancelAccountDeletion: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateProfile: (input: UpdateProfileInput) => Promise<void>;
  changePassword: (input: ChangePasswordInput) => Promise<void>;
  deleteAccount: () => Promise<void>;
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

  // Register a global handler invoked when any *authenticated* request
  // returns 401 (token expired/invalidated mid-session). Purge the session
  // so the router falls back to the sign-in screen. The demo session never
  // reaches the live backend, so it is left untouched as a safety net.
  useEffect(() => {
    authSession.setUnauthorizedHandler(() => {
      if (dataSource.useDemoData) {
        return;
      }
      void authSession.clear();
      setSession(null);
      setError("Session expirée, reconnecte-toi.");
    });

    return () => {
      authSession.setUnauthorizedHandler(null);
    };
  }, []);

  const handleLogin = useCallback(async (email: string, password: string) => {
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
  }, []);

  const handleSignup = useCallback(async (input: SignupInput) => {
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
  }, []);

  const handleRequestPasswordReset = useCallback(async (email: string) => {
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
  }, []);

  const handleRefreshProfile = useCallback(async () => {
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
  }, [session]);

  const handleUpdateProfile = useCallback(
    async (input: UpdateProfileInput) => {
      if (!session?.accessToken) {
        return;
      }

      setIsLoading(true);
      setError(null);
      try {
        if (
          dataSource.useDemoData &&
          session.accessToken === DEMO_ACCESS_TOKEN
        ) {
          setSession({
            accessToken: session.accessToken,
            user: {
              ...session.user,
              ...(input.email !== undefined && { email: input.email }),
              ...(input.username !== undefined && { username: input.username }),
              ...(input.firstName !== undefined && {
                firstName: input.firstName,
              }),
              ...(input.lastName !== undefined && { lastName: input.lastName }),
              ...(input.bio !== undefined && { bio: input.bio }),
              updatedAt: new Date().toISOString(),
            },
          });
          return;
        }

        const updatedUser = await updateCurrentUser(input);
        setSession({ accessToken: session.accessToken, user: updatedUser });
      } catch (err) {
        const message = getErrorMessage(
          err,
          "Impossible de mettre à jour le profil",
        );
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [session],
  );

  const handleChangePassword = useCallback(
    async (input: ChangePasswordInput) => {
      setIsLoading(true);
      setError(null);
      try {
        if (
          dataSource.useDemoData &&
          session?.accessToken === DEMO_ACCESS_TOKEN
        ) {
          throw new Error(
            "La modification du mot de passe est indisponible en mode démo.",
          );
        }

        await changeCurrentUserPassword(input);
      } catch (err) {
        const message = getErrorMessage(
          err,
          "Impossible de modifier le mot de passe",
        );
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [session?.accessToken],
  );

  const handleDemoLogin = useCallback(async () => {
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
  }, []);

  const handleLogout = useCallback(async () => {
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
  }, []);

  const handleDeleteAccount = useCallback(async () => {
    if (!session?.accessToken) {
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      if (dataSource.useDemoData && session.accessToken === DEMO_ACCESS_TOKEN) {
        throw new Error(
          "La suppression du compte est indisponible en mode démo.",
        );
      }

      await deleteCurrentUser();
      await Promise.allSettled([
        purgeScanLocalData(),
        purgeLabelDrafts(),
        purgeAccountPreferences(),
      ]);
      await authSession.clear();
      setSession(null);
    } catch (err) {
      const message = getErrorMessage(err, "Impossible de supprimer le compte");
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [session]);

  const handleRequestAccountDeletion = useCallback(async () => {
    if (!session?.accessToken) {
      throw new Error("Aucune session active.");
    }

    setIsLoading(true);
    setError(null);
    try {
      if (dataSource.useDemoData && session.accessToken === DEMO_ACCESS_TOKEN) {
        throw new Error(
          "La suppression du compte est indisponible en mode démo.",
        );
      }

      const schedule = await requestCurrentUserDeletion();
      setSession((current) =>
        current
          ? {
              ...current,
              user: {
                ...current.user,
                deletionRequestedAt: schedule.requestedAt,
                deletionScheduledFor: schedule.scheduledFor,
              },
            }
          : current,
      );
      return schedule;
    } catch (err) {
      const message = getErrorMessage(
        err,
        "Impossible de planifier la suppression du compte",
      );
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [session]);

  const handleCancelAccountDeletion = useCallback(async () => {
    if (!session?.accessToken) {
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      await cancelCurrentUserDeletion();
      setSession((current) =>
        current
          ? {
              ...current,
              user: {
                ...current.user,
                deletionRequestedAt: null,
                deletionScheduledFor: null,
              },
            }
          : current,
      );
    } catch (err) {
      const message = getErrorMessage(
        err,
        "Impossible d'annuler la suppression du compte",
      );
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [session]);

  const value = useMemo<AuthContextValue>(
    () => ({
      session: isBootstrapped ? session : null,
      isLoading,
      error,
      login: handleLogin,
      signup: handleSignup,
      requestPasswordReset: handleRequestPasswordReset,
      requestAccountDeletion: handleRequestAccountDeletion,
      cancelAccountDeletion: handleCancelAccountDeletion,
      refreshProfile: handleRefreshProfile,
      updateProfile: handleUpdateProfile,
      changePassword: handleChangePassword,
      deleteAccount: handleDeleteAccount,
      loginWithDemoAccount: handleDemoLogin,
      logout: handleLogout,
    }),
    [
      session,
      isLoading,
      error,
      isBootstrapped,
      handleRefreshProfile,
      handleUpdateProfile,
      handleChangePassword,
      handleDeleteAccount,
      handleRequestPasswordReset,
      handleRequestAccountDeletion,
      handleCancelAccountDeletion,
      handleLogin,
      handleSignup,
      handleDemoLogin,
      handleLogout,
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
