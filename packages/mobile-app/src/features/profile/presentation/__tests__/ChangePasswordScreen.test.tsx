import {
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react-native";
import React from "react";

import { ChangePasswordScreen } from "../ChangePasswordScreen";

const mockBack = jest.fn();
const mockChangePassword = jest.fn();

jest.mock("expo-router", () => ({
  useRouter: () => ({ back: mockBack }),
  usePathname: () => "/(app)/profile/password",
}));
jest.mock("@expo/vector-icons", () => ({ Ionicons: () => null }));
jest.mock("@/core/auth/auth-context", () => ({
  useAuth: () => ({ changePassword: mockChangePassword, isLoading: false }),
}));

describe("ChangePasswordScreen", () => {
  beforeEach(() => {
    mockBack.mockReset();
    mockChangePassword.mockReset();
  });

  it("rejects mismatched passwords locally", () => {
    // Arrange
    render(<ChangePasswordScreen />);

    fireEvent.changeText(
      screen.getByLabelText("Mot de passe actuel"),
      "OldPassword1!",
    );
    fireEvent.changeText(
      screen.getByLabelText("Nouveau mot de passe"),
      "NewPassword1!",
    );
    fireEvent.changeText(
      screen.getByLabelText("Confirmer le nouveau mot de passe"),
      "Different1!",
    );

    // Act
    fireEvent.press(
      screen.getByLabelText("Enregistrer le nouveau mot de passe"),
    );

    // Assert
    expect(screen.getByText(/ne correspondent pas/)).toBeTruthy();
    expect(mockChangePassword).not.toHaveBeenCalled();
  });

  it("changes a valid password and returns to the profile", async () => {
    // Arrange
    mockChangePassword.mockResolvedValue(undefined);
    render(<ChangePasswordScreen />);

    fireEvent.changeText(
      screen.getByLabelText("Mot de passe actuel"),
      "OldPassword1!",
    );
    fireEvent.changeText(
      screen.getByLabelText("Nouveau mot de passe"),
      "NewPassword1!",
    );
    fireEvent.changeText(
      screen.getByLabelText("Confirmer le nouveau mot de passe"),
      "NewPassword1!",
    );
    fireEvent.press(
      screen.getByLabelText("Enregistrer le nouveau mot de passe"),
    );

    // Act
    await waitFor(() => {
      // Assert
      expect(mockChangePassword).toHaveBeenCalledWith({
        currentPassword: "OldPassword1!",
        newPassword: "NewPassword1!",
      });
      expect(mockBack).toHaveBeenCalledTimes(1);
    });
  });

  it("rejects incomplete password fields locally", () => {
    // Arrange
    render(<ChangePasswordScreen />);

    // Act
    fireEvent.press(
      screen.getByLabelText("Enregistrer le nouveau mot de passe"),
    );

    // Assert
    expect(
      screen.getByText("Complète les trois champs pour continuer."),
    ).toBeTruthy();
    expect(mockChangePassword).not.toHaveBeenCalled();
  });

  it("shows the backend error and stays on the form when changing fails", async () => {
    // Arrange
    mockChangePassword.mockRejectedValueOnce(
      new Error("Mot de passe actuel incorrect"),
    );
    render(<ChangePasswordScreen />);
    fireEvent.changeText(
      screen.getByLabelText("Mot de passe actuel"),
      "OldPassword1!",
    );
    fireEvent.changeText(
      screen.getByLabelText("Nouveau mot de passe"),
      "NewPassword1!",
    );
    fireEvent.changeText(
      screen.getByLabelText("Confirmer le nouveau mot de passe"),
      "NewPassword1!",
    );

    // Act
    fireEvent.press(
      screen.getByLabelText("Enregistrer le nouveau mot de passe"),
    );

    // Assert
    expect(
      await screen.findByText("Mot de passe actuel incorrect"),
    ).toBeTruthy();
    expect(mockBack).not.toHaveBeenCalled();
  });

  it("ignores a second password change while the first request is pending", async () => {
    // Arrange
    let resolveChange: () => void = () => undefined;
    const pendingChange = new Promise<void>((resolve) => {
      resolveChange = resolve;
    });
    mockChangePassword.mockReturnValue(pendingChange);
    render(<ChangePasswordScreen />);
    fireEvent.changeText(
      screen.getByLabelText("Mot de passe actuel"),
      "OldPassword1!",
    );
    fireEvent.changeText(
      screen.getByLabelText("Nouveau mot de passe"),
      "NewPassword1!",
    );
    fireEvent.changeText(
      screen.getByLabelText("Confirmer le nouveau mot de passe"),
      "NewPassword1!",
    );

    // Act
    fireEvent.press(
      screen.getByLabelText("Enregistrer le nouveau mot de passe"),
    );
    fireEvent.press(
      screen.getByLabelText("Enregistrer le nouveau mot de passe"),
    );

    // Assert
    expect(mockChangePassword).toHaveBeenCalledTimes(1);

    resolveChange();
    await waitFor(() => expect(mockBack).toHaveBeenCalledTimes(1));
  });
});
