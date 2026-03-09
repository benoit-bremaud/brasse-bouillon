import {
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react-native";
import { Alert, AlertButton } from "react-native";

import { ProfileScreen } from "@/features/auth/presentation/ProfileScreen";
import React from "react";

function getTestWindow(): Window & typeof globalThis {
  if (typeof globalThis.window === "undefined") {
    Object.defineProperty(globalThis, "window", {
      value: {} as Window & typeof globalThis,
      configurable: true,
      writable: true,
    });
  }

  return globalThis.window as Window & typeof globalThis;
}

const mockRefreshProfile = jest.fn();
const mockLogout = jest.fn();

jest.mock("@expo/vector-icons", () => ({
  Ionicons: () => null,
}));

jest.mock("@/core/auth/auth-context", () => ({
  useAuth: () => ({
    session: {
      accessToken: "token",
      user: {
        id: "u1",
        email: "brewer@example.com",
        username: "brewer",
        firstName: "Benoit",
        role: "user",
        isActive: true,
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
      },
    },
    refreshProfile: mockRefreshProfile,
    logout: mockLogout,
    isLoading: false,
  }),
}));

describe("ProfileScreen", () => {
  let alertSpy: jest.SpyInstance;

  beforeAll(() => {
    alertSpy = jest.spyOn(Alert, "alert").mockImplementation(() => {});

    getTestWindow();
  });

  beforeEach(() => {
    mockRefreshProfile.mockReset();
    mockLogout.mockReset();
    alertSpy.mockClear();
  });

  afterAll(() => {
    alertSpy.mockRestore();
  });

  it("renders profile information", () => {
    render(<ProfileScreen />);

    expect(screen.getByText("Profil")).toBeTruthy();
    expect(screen.getByText("Benoit")).toBeTruthy();
    expect(screen.getByText("brewer@example.com")).toBeTruthy();
    expect(screen.getByText("brewer")).toBeTruthy();
    expect(screen.getByText("user")).toBeTruthy();
  });

  it("refreshes profile and shows success feedback", async () => {
    mockRefreshProfile.mockResolvedValue(undefined);

    render(<ProfileScreen />);

    fireEvent.press(screen.getByLabelText("Rafraîchir le profil"));

    await waitFor(() => {
      expect(mockRefreshProfile).toHaveBeenCalledTimes(1);
      expect(
        screen.getByText("Profil synchronisé avec le backend."),
      ).toBeTruthy();
    });
  });

  it("uses native alert confirmation when browser confirm is unavailable", async () => {
    const testWindow = getTestWindow();
    const originalConfirm = testWindow.confirm;

    Object.defineProperty(testWindow, "confirm", {
      value: undefined,
      configurable: true,
    });

    mockLogout.mockResolvedValue(undefined);

    try {
      render(<ProfileScreen />);

      fireEvent.press(screen.getByLabelText("Se déconnecter"));

      expect(mockLogout).not.toHaveBeenCalled();
      expect(alertSpy).toHaveBeenCalledTimes(1);

      const alertCall = alertSpy.mock.calls[0];
      expect(alertCall[0]).toBe("Confirmer la déconnexion");

      const buttons = (alertCall[2] ?? []) as AlertButton[];
      const confirmButton = buttons.find(
        (button) => button.text === "Se déconnecter",
      );

      expect(confirmButton).toBeDefined();

      confirmButton?.onPress?.();

      await waitFor(() => {
        expect(mockLogout).toHaveBeenCalledTimes(1);
      });
    } finally {
      Object.defineProperty(testWindow, "confirm", {
        value: originalConfirm,
        configurable: true,
      });
    }
  });

  it("uses browser confirm when available", async () => {
    const testWindow = getTestWindow();
    const originalConfirm = testWindow.confirm;

    Object.defineProperty(testWindow, "confirm", {
      value: jest.fn().mockReturnValue(true),
      configurable: true,
    });

    const confirmMock = testWindow.confirm as jest.Mock;

    mockLogout.mockResolvedValue(undefined);

    try {
      render(<ProfileScreen />);

      fireEvent.press(screen.getByLabelText("Se déconnecter"));

      expect(alertSpy).not.toHaveBeenCalled();
      expect(confirmMock).toHaveBeenCalledTimes(1);

      await waitFor(() => {
        expect(mockLogout).toHaveBeenCalledTimes(1);
      });
    } finally {
      Object.defineProperty(testWindow, "confirm", {
        value: originalConfirm,
        configurable: true,
      });
    }
  });
});
