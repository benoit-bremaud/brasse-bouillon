import {
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react-native";
import React from "react";
import { Linking } from "react-native";

import { AboutScreen } from "../AboutScreen";

const mockBack = jest.fn();

jest.mock("expo-router", () => ({
  useRouter: () => ({ back: mockBack }),
  usePathname: () => "/(app)/profile/about",
}));
jest.mock("@expo/vector-icons", () => ({ Ionicons: () => null }));
jest.mock("expo-updates", () => ({
  channel: "preview",
  updateId: "ota-123",
  createdAt: new Date("2026-07-15T10:00:00.000Z"),
}));

describe("AboutScreen", () => {
  beforeEach(() => {
    mockBack.mockReset();
    jest.spyOn(Linking, "openURL").mockResolvedValue(true);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("renders the app build metadata and support guidance", () => {
    // Arrange
    render(<AboutScreen />);

    // Act

    // Assert
    expect(screen.getByText("À propos de Brasse Bouillon")).toBeTruthy();
    expect(screen.getByText("Version")).toBeTruthy();
    expect(screen.getByText("Commit")).toBeTruthy();
    expect(screen.getByText("Build")).toBeTruthy();
    expect(screen.getByText("Canal OTA")).toBeTruthy();
    expect(screen.getByText("Identifiant OTA")).toBeTruthy();
    expect(screen.getByText("Dernière mise à jour")).toBeTruthy();
    expect(screen.getByText("Support")).toBeTruthy();
    expect(screen.getByText("Soutenir le projet")).toBeTruthy();
    expect(screen.getByText("Informations légales")).toBeTruthy();
  });

  it("returns to the profile", () => {
    // Arrange
    render(<AboutScreen />);

    // Act
    fireEvent.press(screen.getByLabelText("Retour au profil"));

    // Assert
    expect(mockBack).toHaveBeenCalledTimes(1);
  });

  it("opens the canonical privacy policy from the legal links", async () => {
    // Arrange
    render(<AboutScreen />);

    // Act
    fireEvent.press(
      screen.getByLabelText("Ouvrir Politique de confidentialité"),
    );

    // Assert
    await waitFor(() => {
      expect(Linking.openURL).toHaveBeenCalledWith(
        "https://brasse-bouillon.com/privacy",
      );
    });
  });

  it("opens the Ko-fi support page from the support card", async () => {
    // Arrange
    render(<AboutScreen />);

    // Act
    fireEvent.press(screen.getByLabelText("Offre-moi une bière sur Ko-fi"));

    // Assert
    await waitFor(() => {
      expect(Linking.openURL).toHaveBeenCalledWith(
        "https://ko-fi.com/brassebouillon",
      );
    });
  });

  it("shows an actionable error when the Ko-fi page cannot open", async () => {
    // Arrange
    jest
      .spyOn(Linking, "openURL")
      .mockRejectedValueOnce(new Error("Aucun navigateur disponible"));
    render(<AboutScreen />);

    // Act
    fireEvent.press(screen.getByLabelText("Offre-moi une bière sur Ko-fi"));

    // Assert
    expect(await screen.findByText("Aucun navigateur disponible")).toBeTruthy();
  });

  it("shows an actionable error when the legal page cannot open", async () => {
    // Arrange
    jest
      .spyOn(Linking, "openURL")
      .mockRejectedValueOnce(new Error("Navigateur indisponible"));
    render(<AboutScreen />);

    // Act
    fireEvent.press(screen.getByLabelText("Ouvrir Mentions légales"));

    // Assert
    expect(await screen.findByText("Navigateur indisponible")).toBeTruthy();
  });
});
