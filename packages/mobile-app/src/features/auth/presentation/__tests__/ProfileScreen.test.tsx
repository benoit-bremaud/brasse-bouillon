import {
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react-native";
import React from "react";

import { ProfileScreen } from "@/features/profile/presentation/ProfileScreen";

const mockPush = jest.fn();
const mockLogout = jest.fn();
const mockGetBrewerStats = jest.fn();

jest.mock("expo-router", () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => "/(app)/profile",
}));

jest.mock("@expo/vector-icons", () => ({ Ionicons: () => null }));
jest.mock("@/features/profile/application/brewer-stats.use-cases", () => ({
  getBrewerStats: (...args: unknown[]) => mockGetBrewerStats(...args),
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
        lastName: "Bremaud",
        bio: "Je brasse le week-end.",
        role: "user",
        isActive: true,
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
      },
    },
    updateProfile: jest.fn(),
    changePassword: jest.fn(),
    logout: mockLogout,
    isLoading: false,
  }),
}));

describe("ProfileScreen", () => {
  beforeEach(() => {
    mockPush.mockReset();
    mockLogout.mockReset();
    mockGetBrewerStats.mockReset();
    mockGetBrewerStats.mockReturnValue(new Promise(() => undefined));
  });

  it("renders an account-focused profile hub", async () => {
    // Arrange
    mockGetBrewerStats.mockResolvedValue({
      activeBatches: 1,
      completedBatches: 6,
      authoredRecipes: 3,
      submittedScans: 4,
      level: "Brasseur",
    });
    render(<ProfileScreen />);

    // Act
    await screen.findByText("Brasseur");

    // Assert
    expect(screen.getByText("Mon profil")).toBeTruthy();
    expect(screen.getByText("Benoit Bremaud")).toBeTruthy();
    expect(screen.getByText("brewer@example.com")).toBeTruthy();
    expect(screen.getByText("Je brasse le week-end.")).toBeTruthy();
    expect(screen.getByText("Compte et sécurité")).toBeTruthy();
    expect(screen.getByText("Données")).toBeTruthy();
    expect(screen.getByText("Confidentialité et données")).toBeTruthy();
    expect(screen.getByText("Mon parcours de brasseur")).toBeTruthy();
    expect(screen.getByText("Brasseur")).toBeTruthy();
    expect(screen.getByText("Brassins terminés")).toBeTruthy();
    expect(screen.getByText("Application")).toBeTruthy();
    expect(screen.getByText("À propos de l'application")).toBeTruthy();
    expect(screen.getByText("Informations personnelles")).toBeTruthy();
    expect(screen.getByText("Mot de passe")).toBeTruthy();
    expect(screen.queryByText("Rafraîchir le profil")).toBeNull();
  });

  it("opens the identity route", () => {
    // Arrange
    render(<ProfileScreen />);

    // Act
    fireEvent.press(screen.getByText("Informations personnelles"));

    // Assert
    expect(mockPush).toHaveBeenCalledWith("/(app)/profile/edit");
  });

  it("opens the password route", () => {
    // Arrange
    render(<ProfileScreen />);

    // Act
    fireEvent.press(screen.getByText("Mot de passe"));

    // Assert
    expect(mockPush).toHaveBeenCalledWith("/(app)/profile/password");
  });

  it("opens the About route", () => {
    // Arrange
    render(<ProfileScreen />);

    // Act
    fireEvent.press(screen.getByText("À propos de l'application"));

    // Assert
    expect(mockPush).toHaveBeenCalledWith("/(app)/profile/about");
  });

  it("opens the privacy preferences route", () => {
    // Arrange
    render(<ProfileScreen />);

    // Act
    fireEvent.press(screen.getByText("Confidentialité et données"));

    // Assert
    expect(mockPush).toHaveBeenCalledWith("/(app)/profile/privacy");
  });

  it("keeps the account hub usable when stats cannot be loaded", async () => {
    // Arrange
    mockGetBrewerStats.mockRejectedValueOnce(new Error("Stats unavailable"));
    render(<ProfileScreen />);

    // Act
    const unavailableMessage = await screen.findByText(
      /Tes statistiques seront disponibles/,
    );

    // Assert
    expect(unavailableMessage).toBeTruthy();
    expect(screen.getByText("Mon profil")).toBeTruthy();
  });

  it("confirms logout before calling the auth action", async () => {
    // Arrange
    mockLogout.mockResolvedValue(undefined);
    render(<ProfileScreen />);

    // Act
    fireEvent.press(screen.getByLabelText("Se déconnecter"));

    // Assert
    expect(mockLogout).not.toHaveBeenCalled();
    expect(screen.getByText("Confirmer la déconnexion")).toBeTruthy();

    // Act
    fireEvent.press(screen.getByLabelText("Confirmer la déconnexion"));

    // Assert
    await waitFor(() => expect(mockLogout).toHaveBeenCalledTimes(1));
  });

  it("shows the logout error without crashing the profile hub", async () => {
    // Arrange
    mockLogout.mockRejectedValueOnce(new Error("Session indisponible"));
    render(<ProfileScreen />);
    fireEvent.press(screen.getByLabelText("Se déconnecter"));

    // Act
    fireEvent.press(screen.getByLabelText("Confirmer la déconnexion"));

    // Assert
    expect(await screen.findByText("Session indisponible")).toBeTruthy();
    expect(screen.getByText("Mon profil")).toBeTruthy();
  });
});
