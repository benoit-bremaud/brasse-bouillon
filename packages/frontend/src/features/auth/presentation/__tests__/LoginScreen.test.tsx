import {
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react-native";

import { LoginScreen } from "@/features/auth/presentation/LoginScreen";
import React from "react";

const mockLogin = jest.fn();
const mockSignup = jest.fn();
const mockRequestPasswordReset = jest.fn();
const mockLoginWithDemoAccount = jest.fn();

jest.mock("@/core/auth/auth-context", () => ({
  useAuth: () => ({
    login: mockLogin,
    signup: mockSignup,
    requestPasswordReset: mockRequestPasswordReset,
    loginWithDemoAccount: mockLoginWithDemoAccount,
    isLoading: false,
    error: null,
  }),
}));

describe("LoginScreen", () => {
  beforeEach(() => {
    mockLogin.mockReset();
    mockSignup.mockReset();
    mockRequestPasswordReset.mockReset();
    mockLoginWithDemoAccount.mockReset();
  });

  it("renders complete auth entry points", () => {
    render(<LoginScreen />);

    expect(screen.getByText("Brasse Bouillon")).toBeTruthy();
    expect(screen.getByText("Connecte-toi pour continuer")).toBeTruthy();
    expect(screen.getByText("Connexion")).toBeTruthy();
    expect(screen.getByText("Créer un compte")).toBeTruthy();
    expect(screen.getByText("Mot de passe oublié")).toBeTruthy();
    expect(screen.getByPlaceholderText("Email")).toBeTruthy();
    expect(screen.getByPlaceholderText("Mot de passe")).toBeTruthy();
    expect(screen.getByText("Connexion démo")).toBeTruthy();
  });

  it("switches to signup mode and validates required fields", async () => {
    render(<LoginScreen />);

    fireEvent.press(screen.getByText("Créer un compte"));

    expect(screen.getByText("Crée ton compte pour démarrer")).toBeTruthy();
    expect(screen.getByPlaceholderText("Nom d'utilisateur")).toBeTruthy();
    expect(
      screen.getByPlaceholderText("Confirmer le mot de passe"),
    ).toBeTruthy();

    fireEvent.press(screen.getByText("Créer mon compte"));

    await waitFor(() => {
      expect(
        screen.getByText("Email, mot de passe et nom d’utilisateur requis."),
      ).toBeTruthy();
    });

    expect(mockSignup).not.toHaveBeenCalled();
  });

  it("submits forgot password request", async () => {
    mockRequestPasswordReset.mockResolvedValue(undefined);
    render(<LoginScreen />);

    fireEvent.press(screen.getByText("Mot de passe oublié"));
    fireEvent.changeText(screen.getByPlaceholderText("Email"), "demo@bb.test");
    fireEvent.press(screen.getByText("Envoyer le lien"));

    await waitFor(() => {
      expect(mockRequestPasswordReset).toHaveBeenCalledWith("demo@bb.test");
      expect(
        screen.getByText(
          "Si un compte existe pour cet email, un lien de réinitialisation vient d’être envoyé.",
        ),
      ).toBeTruthy();
    });
  });

  it("triggers demo login", async () => {
    mockLoginWithDemoAccount.mockResolvedValue(undefined);
    render(<LoginScreen />);

    fireEvent.press(screen.getByText("Connexion démo"));

    await waitFor(() => {
      expect(mockLoginWithDemoAccount).toHaveBeenCalledTimes(1);
    });
  });
});
