import {
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react-native";
import React from "react";

import { EditProfileScreen } from "../EditProfileScreen";

const mockBack = jest.fn();
const mockUpdateProfile = jest.fn();

jest.mock("expo-router", () => ({
  useRouter: () => ({ back: mockBack }),
  usePathname: () => "/(app)/profile/edit",
}));
jest.mock("@expo/vector-icons", () => ({ Ionicons: () => null }));
jest.mock("@/core/auth/auth-context", () => ({
  useAuth: () => ({
    session: {
      user: {
        email: "old@example.com",
        username: "old_user",
        firstName: "Old",
        lastName: "Name",
      },
    },
    updateProfile: mockUpdateProfile,
    isLoading: false,
  }),
}));

describe("EditProfileScreen", () => {
  beforeEach(() => {
    mockBack.mockReset();
    mockUpdateProfile.mockReset();
  });

  it("validates the username before saving", () => {
    // Arrange
    render(<EditProfileScreen />);

    // Act
    fireEvent.changeText(screen.getByLabelText("Identifiant"), "x");
    fireEvent.press(screen.getByLabelText("Enregistrer mes informations"));

    // Assert
    expect(screen.getByText(/entre 3 et 20 caractères/)).toBeTruthy();
    expect(mockUpdateProfile).not.toHaveBeenCalled();
  });

  it("validates the email before saving", () => {
    // Arrange
    render(<EditProfileScreen />);

    // Act
    fireEvent.changeText(screen.getByLabelText("Adresse e-mail"), "invalid");
    fireEvent.press(screen.getByLabelText("Enregistrer mes informations"));

    // Assert
    expect(screen.getByText("Saisis une adresse e-mail valide.")).toBeTruthy();
    expect(mockUpdateProfile).not.toHaveBeenCalled();
  });

  it("saves valid identity data and returns to the profile", async () => {
    // Arrange
    mockUpdateProfile.mockResolvedValue(undefined);
    render(<EditProfileScreen />);

    fireEvent.changeText(screen.getByLabelText("Prénom"), "New");
    fireEvent.changeText(screen.getByLabelText("Nom"), "Name");
    fireEvent.changeText(screen.getByLabelText("Identifiant"), "new_user");
    fireEvent.changeText(
      screen.getByLabelText("Bio"),
      "Je brasse le week-end.",
    );
    fireEvent.changeText(
      screen.getByLabelText("Adresse e-mail"),
      "new@example.com",
    );
    fireEvent.press(screen.getByLabelText("Enregistrer mes informations"));

    // Act
    await waitFor(() => {
      // Assert
      expect(mockUpdateProfile).toHaveBeenCalledWith({
        email: "new@example.com",
        username: "new_user",
        firstName: "New",
        lastName: "Name",
        bio: "Je brasse le week-end.",
      });
      expect(mockBack).toHaveBeenCalledTimes(1);
    });
  });

  it("shows the backend error and stays on the form when saving fails", async () => {
    // Arrange
    mockUpdateProfile.mockRejectedValueOnce(new Error("Adresse déjà utilisée"));
    render(<EditProfileScreen />);

    // Act
    fireEvent.press(screen.getByLabelText("Enregistrer mes informations"));

    // Assert
    expect(await screen.findByText("Adresse déjà utilisée")).toBeTruthy();
    expect(mockBack).not.toHaveBeenCalled();
  });

  it("ignores a second save while the first request is pending", async () => {
    // Arrange
    let resolveUpdate: () => void = () => undefined;
    const pendingUpdate = new Promise<void>((resolve) => {
      resolveUpdate = resolve;
    });
    mockUpdateProfile.mockReturnValue(pendingUpdate);
    render(<EditProfileScreen />);

    // Act
    fireEvent.press(screen.getByLabelText("Enregistrer mes informations"));
    fireEvent.press(screen.getByLabelText("Enregistrer mes informations"));

    // Assert
    expect(mockUpdateProfile).toHaveBeenCalledTimes(1);

    resolveUpdate();
    await waitFor(() => expect(mockBack).toHaveBeenCalledTimes(1));
  });
});
