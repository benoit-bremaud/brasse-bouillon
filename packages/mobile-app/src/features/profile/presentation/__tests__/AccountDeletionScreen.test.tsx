import {
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react-native";
import React from "react";

import { AccountDeletionScreen } from "../AccountDeletionScreen";

const mockBack = jest.fn();
const mockRequestAccountDeletion = jest.fn();
const mockCancelAccountDeletion = jest.fn();
const mockUseAuth = jest.fn();

jest.mock("expo-router", () => ({
  useRouter: () => ({ back: mockBack }),
  usePathname: () => "/(app)/profile/delete",
}));
jest.mock("@expo/vector-icons", () => ({ Ionicons: () => null }));
jest.mock("@/core/auth/auth-context", () => ({
  useAuth: () => mockUseAuth(),
}));

describe("AccountDeletionScreen", () => {
  beforeEach(() => {
    mockBack.mockReset();
    mockRequestAccountDeletion.mockReset();
    mockCancelAccountDeletion.mockReset();
    mockUseAuth.mockReturnValue({
      session: { user: { username: "brasseur" } },
      requestAccountDeletion: mockRequestAccountDeletion,
      cancelAccountDeletion: mockCancelAccountDeletion,
      isLoading: false,
    });
  });

  it("keeps deletion disabled until the exact username is entered", () => {
    // Arrange
    render(<AccountDeletionScreen />);

    // Act
    const deleteButton = screen.getByLabelText(
      "Préparer la suppression du compte",
    );

    // Assert
    fireEvent.press(deleteButton);
    expect(screen.queryByText("Confirmer la suppression")).toBeNull();
    expect(mockRequestAccountDeletion).not.toHaveBeenCalled();
    fireEvent.changeText(
      screen.getByLabelText("Confirmation de suppression"),
      "brasseu",
    );
    fireEvent.press(deleteButton);
    expect(screen.queryByText("Confirmer la suppression")).toBeNull();
  });

  it("requires a second confirmation before deleting the account", async () => {
    // Arrange
    mockRequestAccountDeletion.mockResolvedValue({
      status: "scheduled",
      requestedAt: "2026-07-16T10:00:00.000Z",
      scheduledFor: "2026-08-15T10:00:00.000Z",
      gracePeriodDays: 30,
    });
    render(<AccountDeletionScreen />);
    fireEvent.changeText(
      screen.getByLabelText("Confirmation de suppression"),
      "brasseur",
    );

    // Act
    fireEvent.press(screen.getByLabelText("Préparer la suppression du compte"));

    // Assert
    expect(screen.getByText("Confirmer la suppression")).toBeTruthy();
    expect(mockRequestAccountDeletion).not.toHaveBeenCalled();
    fireEvent.press(
      screen.getByLabelText("Confirmer la programmation de suppression"),
    );
    await waitFor(() =>
      expect(mockRequestAccountDeletion).toHaveBeenCalledTimes(1),
    );
  });

  it("shows a deletion error and stays available for retry", async () => {
    // Arrange
    mockRequestAccountDeletion.mockRejectedValueOnce(
      new Error("Compte indisponible"),
    );
    render(<AccountDeletionScreen />);
    fireEvent.changeText(
      screen.getByLabelText("Confirmation de suppression"),
      "brasseur",
    );
    fireEvent.press(screen.getByLabelText("Préparer la suppression du compte"));

    // Act
    fireEvent.press(
      screen.getByLabelText("Confirmer la programmation de suppression"),
    );

    // Assert
    expect(await screen.findByText("Compte indisponible")).toBeTruthy();
    expect(screen.getByText("Supprimer mon compte")).toBeTruthy();
  });

  it("cancels a pending deletion without opening the destructive confirmation", async () => {
    // Arrange
    mockCancelAccountDeletion.mockResolvedValue(undefined);
    mockUseAuth.mockReturnValue({
      session: {
        user: {
          username: "brasseur",
          deletionScheduledFor: "2026-08-15T10:00:00.000Z",
        },
      },
      requestAccountDeletion: mockRequestAccountDeletion,
      cancelAccountDeletion: mockCancelAccountDeletion,
      isLoading: false,
    });
    render(<AccountDeletionScreen />);

    // Act
    fireEvent.press(screen.getByLabelText("Annuler la suppression programmée"));

    // Assert
    await waitFor(() =>
      expect(mockCancelAccountDeletion).toHaveBeenCalledTimes(1),
    );
    expect(screen.queryByText("Confirmer la suppression")).toBeNull();
  });
});
