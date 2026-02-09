import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { authSession } from '@/core/auth/session';
import { getErrorMessage } from '@/core/http/http-error';
import { login } from '@/features/auth/data/auth.api';
import { AuthSession } from '@/features/auth/domain/auth.types';

type AuthContextValue = {
  session: AuthSession | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isBootstrapped, setIsBootstrapped] = useState(false);

  useEffect(() => {
    const loadSession = async () => {
      try {
        setIsLoading(true);
        const token = await authSession.load();
        if (token) {
          const now = new Date().toISOString();
          setSession({
            accessToken: token,
            user: {
              id: 'cached',
              email: 'cached@local',
              username: 'cached',
              role: 'user',
              isActive: true,
              createdAt: now,
              updatedAt: now,
            },
          });
        }
      } catch (err) {
        setError(getErrorMessage(err, 'Failed to restore session'));
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
      const message = getErrorMessage(err, 'Login failed');
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
      logout: handleLogout,
    }),
    [session, isLoading, error, isBootstrapped],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return ctx;
}
