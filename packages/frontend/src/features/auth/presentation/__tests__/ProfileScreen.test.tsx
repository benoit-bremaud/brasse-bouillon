import {
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react-native";

import { ProfileScreen } from "@/features/auth/presentation/ProfileScreen";
import React from "react";

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
  beforeEach(() => {
    mockRefreshProfile.mockReset();
    mockLogout.mockReset();
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

  it("opens logout confirmation modal before logout", () => {
    render(<ProfileScreen />);

    fireEvent.press(screen.getByLabelText("Se déconnecter"));

    expect(mockLogout).not.toHaveBeenCalled();
    expect(screen.getByText("Confirmer la déconnexion")).toBeTruthy();
    expect(
      screen.getByText(
        "Voulez-vous vraiment vous déconnecter de l'application ?",
      ),
    ).toBeTruthy();
  });

  it("closes logout confirmation modal when user cancels", () => {
    render(<ProfileScreen />);

    fireEvent.press(screen.getByLabelText("Se déconnecter"));
    fireEvent.press(screen.getByLabelText("Annuler la déconnexion"));

    expect(mockLogout).not.toHaveBeenCalled();
    expect(screen.queryByText("Confirmer la déconnexion")).toBeNull();
  });

  it("calls logout when user confirms in modal", async () => {
    mockLogout.mockResolvedValue(undefined);

    render(<ProfileScreen />);

    fireEvent.press(screen.getByLabelText("Se déconnecter"));
    fireEvent.press(screen.getByLabelText("Confirmer la déconnexion"));

    await waitFor(() => {
      expect(mockLogout).toHaveBeenCalledTimes(1);
    });
  });
});
