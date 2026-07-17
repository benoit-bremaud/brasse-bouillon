import { act, renderHook, waitFor } from "@testing-library/react-native";
import React from "react";

const mockApiLogin = jest.fn();
const mockApiSignup = jest.fn();
const mockApiGetCurrentUser = jest.fn();
const mockApiRequestPasswordReset = jest.fn();
const mockApiDeleteCurrentUser = jest.fn();
const mockApiRequestCurrentUserDeletion = jest.fn();
const mockApiCancelCurrentUserDeletion = jest.fn();
const mockPurgeScanLocalData = jest.fn();
const mockPurgeLabelDrafts = jest.fn();
const mockPurgeAccountPreferences = jest.fn();

jest.mock("@/features/auth/data/auth.api", () => ({
  login: (...args: unknown[]) => mockApiLogin(...args),
  signup: (...args: unknown[]) => mockApiSignup(...args),
  getCurrentUser: (...args: unknown[]) => mockApiGetCurrentUser(...args),
  requestPasswordReset: (...args: unknown[]) =>
    mockApiRequestPasswordReset(...args),
  deleteCurrentUser: (...args: unknown[]) => mockApiDeleteCurrentUser(...args),
  requestCurrentUserDeletion: (...args: unknown[]) =>
    mockApiRequestCurrentUserDeletion(...args),
  cancelCurrentUserDeletion: (...args: unknown[]) =>
    mockApiCancelCurrentUserDeletion(...args),
}));

jest.mock("@/features/scan/application/scan.use-cases", () => ({
  purgeScanLocalData: (...args: unknown[]) => mockPurgeScanLocalData(...args),
}));
jest.mock("@/features/labels/application/labels.use-cases", () => ({
  purgeLabelDrafts: (...args: unknown[]) => mockPurgeLabelDrafts(...args),
}));
jest.mock(
  "@/features/profile/application/account-preferences.use-cases",
  () => ({
    purgeAccountPreferences: (...args: unknown[]) =>
      mockPurgeAccountPreferences(...args),
  }),
);

const mockSessionLoad = jest.fn();
const mockSessionSetAccessToken = jest.fn();
const mockSessionClear = jest.fn();

// Capture the handler the provider registers via setUnauthorizedHandler,
// so tests can simulate a mid-session 401 by invoking it directly.
let capturedUnauthorizedHandler: (() => void) | null = null;

jest.mock("@/core/auth/session", () => ({
  authSession: {
    load: () => mockSessionLoad(),
    setAccessToken: (token: string) => mockSessionSetAccessToken(token),
    clear: () => mockSessionClear(),
    setUnauthorizedHandler: (handler: (() => void) | null) => {
      capturedUnauthorizedHandler = handler;
    },
  },
}));

// Mutable mock so each test starts with a known dataSource state and
// we can observe runtime flips driven by the demo-credentials trigger.
const dataSourceMock = { useDemoData: false };
jest.mock("@/core/data/data-source", () => ({
  get dataSource() {
    return dataSourceMock;
  },
}));

// Capture the boot-time env value the way `auth-context` does — so
// when handleLogout restores the flag, it restores to this snapshot.
const envMock = { useDemoData: false };
jest.mock("@/core/config/env", () => ({
  get env() {
    return envMock;
  },
}));

import { AuthProvider, useAuth } from "@/core/auth/auth-context";
import {
  DEMO_TRIGGER_EMAIL,
  DEMO_TRIGGER_PASSWORD,
} from "@/features/auth/domain/demo-trigger-credentials";

function wrapper({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}

describe("AuthProvider — demo-trigger credentials (Issue #822)", () => {
  beforeEach(() => {
    mockApiLogin.mockReset();
    mockApiSignup.mockReset();
    mockApiGetCurrentUser.mockReset();
    mockApiRequestPasswordReset.mockReset();
    mockApiDeleteCurrentUser.mockReset().mockResolvedValue(undefined);
    mockApiRequestCurrentUserDeletion.mockReset().mockResolvedValue({
      status: "scheduled",
      requestedAt: "2026-07-16T10:00:00.000Z",
      scheduledFor: "2026-08-15T10:00:00.000Z",
      gracePeriodDays: 30,
    });
    mockApiCancelCurrentUserDeletion.mockReset().mockResolvedValue(undefined);
    mockPurgeScanLocalData.mockReset().mockResolvedValue(undefined);
    mockPurgeLabelDrafts.mockReset().mockResolvedValue(undefined);
    mockPurgeAccountPreferences.mockReset().mockResolvedValue(undefined);
    mockSessionLoad.mockReset().mockResolvedValue(null);
    mockSessionSetAccessToken.mockReset().mockResolvedValue(undefined);
    mockSessionClear.mockReset().mockResolvedValue(undefined);
    dataSourceMock.useDemoData = false;
    envMock.useDemoData = false;
    capturedUnauthorizedHandler = null;
  });

  it("happy path: demo trigger credentials flip dataSource into demo mode and create a synthetic session without hitting the API", async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.login(DEMO_TRIGGER_EMAIL, DEMO_TRIGGER_PASSWORD);
    });

    expect(mockApiLogin).not.toHaveBeenCalled();
    expect(dataSourceMock.useDemoData).toBe(true);
    expect(result.current.session?.user.email).toBe(
      "marie.brasseur@example.com",
    );
    expect(mockSessionSetAccessToken).toHaveBeenCalledWith("demo-access-token");
  });

  it("sad path: arbitrary credentials fall through to the regular API login", async () => {
    mockApiLogin.mockResolvedValue({
      accessToken: "real-token-abc",
      user: {
        id: "u-real-1",
        email: "lea@brasse-bouillon.test",
        username: "lea",
        firstName: "Léa",
        lastName: "Curieuse",
        role: "user",
        isActive: true,
        createdAt: "2026-04-30T00:00:00.000Z",
        updatedAt: "2026-04-30T00:00:00.000Z",
      },
    });

    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.login("lea@brasse-bouillon.test", "StrongPass123!");
    });

    expect(mockApiLogin).toHaveBeenCalledWith(
      "lea@brasse-bouillon.test",
      "StrongPass123!",
    );
    expect(dataSourceMock.useDemoData).toBe(false);
    expect(result.current.session?.user.id).toBe("u-real-1");
  });

  it("edge: typo on the demo email (one character off) does NOT trigger demo mode", async () => {
    mockApiLogin.mockRejectedValue({
      status: 401,
      message: "Invalid credentials",
    });

    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      try {
        await result.current.login(
          "demo@brasse-bouillon.com",
          DEMO_TRIGGER_PASSWORD,
        );
      } catch {
        // expected — the API mock rejects.
      }
    });

    // Demo mode never activated, the API was actually called.
    expect(dataSourceMock.useDemoData).toBe(false);
    expect(mockApiLogin).toHaveBeenCalledWith(
      "demo@brasse-bouillon.com",
      DEMO_TRIGGER_PASSWORD,
    );
  });

  it("logout restores the boot-time dataSource flag when demo mode was activated mid-session", async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Activate demo mode via the trigger credentials.
    await act(async () => {
      await result.current.login(DEMO_TRIGGER_EMAIL, DEMO_TRIGGER_PASSWORD);
    });
    expect(dataSourceMock.useDemoData).toBe(true);

    // Logout must restore the flag to its boot-time value (false).
    await act(async () => {
      await result.current.logout();
    });
    expect(dataSourceMock.useDemoData).toBe(false);
    expect(result.current.session).toBeNull();
  });

  it("logout leaves the dataSource flag untouched when demo mode was already on at boot", async () => {
    envMock.useDemoData = true;
    dataSourceMock.useDemoData = true;

    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.logout();
    });

    // Boot-time demo mode stays on after logout.
    expect(dataSourceMock.useDemoData).toBe(true);
  });

  it("deletes a live account before purging local profile data and the session", async () => {
    // Arrange
    mockApiLogin.mockResolvedValue({
      accessToken: "real-token-abc",
      user: {
        id: "u-real-1",
        email: "lea@brasse-bouillon.test",
        username: "lea",
        role: "user",
        isActive: true,
        createdAt: "2026-04-30T00:00:00.000Z",
        updatedAt: "2026-04-30T00:00:00.000Z",
      },
    });
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    await act(async () => {
      await result.current.login("lea@brasse-bouillon.test", "StrongPass123!");
    });

    // Act
    await act(async () => {
      await result.current.deleteAccount();
    });

    // Assert
    expect(mockApiDeleteCurrentUser).toHaveBeenCalledTimes(1);
    expect(mockPurgeScanLocalData).toHaveBeenCalledTimes(1);
    expect(mockPurgeLabelDrafts).toHaveBeenCalledTimes(1);
    expect(mockPurgeAccountPreferences).toHaveBeenCalledTimes(1);
    expect(mockSessionClear).toHaveBeenCalledTimes(1);
    expect(result.current.session).toBeNull();
  });

  it("schedules and cancels deletion without clearing the active session", async () => {
    // Arrange
    mockApiLogin.mockResolvedValue({
      accessToken: "real-token-abc",
      user: {
        id: "u-real-1",
        email: "lea@brasse-bouillon.test",
        username: "lea",
        role: "user",
        isActive: true,
        createdAt: "2026-04-30T00:00:00.000Z",
        updatedAt: "2026-04-30T00:00:00.000Z",
      },
    });
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    await act(async () => {
      await result.current.login("lea@brasse-bouillon.test", "StrongPass123!");
    });

    // Act
    await act(async () => {
      await result.current.requestAccountDeletion();
    });
    await act(async () => {
      await result.current.cancelAccountDeletion();
    });

    // Assert
    expect(mockApiRequestCurrentUserDeletion).toHaveBeenCalledTimes(1);
    expect(mockApiCancelCurrentUserDeletion).toHaveBeenCalledTimes(1);
    expect(result.current.session?.user.deletionScheduledFor).toBeNull();
    expect(mockSessionClear).not.toHaveBeenCalled();
  });

  it("rejects demo account deletion without calling the backend", async () => {
    // Arrange
    dataSourceMock.useDemoData = true;
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    await act(async () => {
      await result.current.login(DEMO_TRIGGER_EMAIL, DEMO_TRIGGER_PASSWORD);
    });

    // Act and Assert
    await expect(
      act(async () => result.current.deleteAccount()),
    ).rejects.toThrow("indisponible en mode démo");
    expect(mockApiDeleteCurrentUser).not.toHaveBeenCalled();
    expect(mockSessionClear).not.toHaveBeenCalled();
  });

  it("bootstrap restores a stored demo session without hitting the API and re-arms the dataSource flag", async () => {
    // Reproduces the soutenance reload scenario: the trigger flow
    // persisted a demo token on a previous run, the app restarts with
    // useDemoData=false (boot default), and the sign-in screen would
    // otherwise hang behind a getCurrentUser timeout.
    mockSessionLoad.mockResolvedValue("demo-access-token");
    dataSourceMock.useDemoData = false;

    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(mockApiGetCurrentUser).not.toHaveBeenCalled();
    expect(dataSourceMock.useDemoData).toBe(true);
    expect(result.current.session?.user.email).toBe(
      "marie.brasseur@example.com",
    );
  });
});

describe("AuthProvider — mid-session 401 / token expiry (#1130)", () => {
  beforeEach(() => {
    mockApiLogin.mockReset();
    mockSessionLoad.mockReset().mockResolvedValue(null);
    mockSessionSetAccessToken.mockReset().mockResolvedValue(undefined);
    mockSessionClear.mockReset().mockResolvedValue(undefined);
    dataSourceMock.useDemoData = false;
    envMock.useDemoData = false;
    capturedUnauthorizedHandler = null;
  });

  it("happy: a registered live session is purged when the unauthorized handler fires", async () => {
    mockApiLogin.mockResolvedValue({
      accessToken: "real-token-abc",
      user: {
        id: "u-real-1",
        email: "lea@brasse-bouillon.test",
        username: "lea",
        role: "user",
        isActive: true,
        createdAt: "2026-04-30T00:00:00.000Z",
        updatedAt: "2026-04-30T00:00:00.000Z",
      },
    });

    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.login("lea@brasse-bouillon.test", "StrongPass123!");
    });
    expect(result.current.session?.user.id).toBe("u-real-1");

    expect(capturedUnauthorizedHandler).not.toBeNull();
    await act(async () => {
      capturedUnauthorizedHandler?.();
    });

    expect(mockSessionClear).toHaveBeenCalled();
    expect(result.current.session).toBeNull();
    expect(result.current.error).toBe("Session expirée, reconnecte-toi.");
  });

  it("edge: the unauthorized handler is a no-op in demo mode (demo session preserved)", async () => {
    dataSourceMock.useDemoData = true;

    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.login(DEMO_TRIGGER_EMAIL, DEMO_TRIGGER_PASSWORD);
    });
    expect(result.current.session?.user.email).toBe(
      "marie.brasseur@example.com",
    );

    await act(async () => {
      capturedUnauthorizedHandler?.();
    });

    expect(mockSessionClear).not.toHaveBeenCalled();
    expect(result.current.session?.user.email).toBe(
      "marie.brasseur@example.com",
    );
  });
});
