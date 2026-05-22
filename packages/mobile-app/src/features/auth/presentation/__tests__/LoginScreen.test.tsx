import {
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react-native";

import { LoginScreen } from "@/features/auth/presentation/LoginScreen";
import { Alert, KeyboardAvoidingView } from "react-native";
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

// `dataSource.useDemoData` controls visibility of the "Connexion démo"
// button per Issue #764. Mutable mock so we can flip per test.
const dataSourceMock = { useDemoData: true };
jest.mock("@/core/data/data-source", () => ({
  get dataSource() {
    return dataSourceMock;
  },
}));

describe("LoginScreen (Issue #764 — simplified signup)", () => {
  beforeEach(() => {
    mockLogin.mockReset();
    mockSignup.mockReset();
    mockRequestPasswordReset.mockReset();
    mockLoginWithDemoAccount.mockReset();
    dataSourceMock.useDemoData = true;
  });

  describe("happy path — login mode", () => {
    it("renders the simplified entry points (no third tab, demo button visible in demo mode)", () => {
      render(<LoginScreen />);

      expect(screen.getByText("Brasse Bouillon")).toBeTruthy();
      expect(screen.getByText("Connecte-toi pour continuer")).toBeTruthy();
      expect(screen.getByText("Connexion")).toBeTruthy();
      expect(screen.getByText("Créer un compte")).toBeTruthy();
      expect(screen.getByPlaceholderText("Email")).toBeTruthy();
      expect(screen.getByPlaceholderText("Mot de passe")).toBeTruthy();
      // Forgot password is now a text link, not a tab.
      expect(screen.getByText("Mot de passe oublié ?")).toBeTruthy();
      // Demo button visible because useDemoData=true.
      expect(screen.getByText("Connexion démo")).toBeTruthy();
    });

    it("submits login with email + password", async () => {
      mockLogin.mockResolvedValue(undefined);
      render(<LoginScreen />);

      fireEvent.changeText(
        screen.getByPlaceholderText("Email"),
        "lea@brasse-bouillon.test",
      );
      fireEvent.changeText(
        screen.getByPlaceholderText("Mot de passe"),
        "StrongPass123!",
      );
      fireEvent.press(screen.getByText("Se connecter"));

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith(
          "lea@brasse-bouillon.test",
          "StrongPass123!",
        );
      });
    });
  });

  describe("happy path — signup mode (Issue #764)", () => {
    it("renders only email + password (no username, no first/last name, no confirm)", () => {
      render(<LoginScreen />);
      fireEvent.press(screen.getByText("Créer un compte"));

      expect(screen.getByText("Crée ton compte pour démarrer")).toBeTruthy();
      expect(screen.getByPlaceholderText("Email")).toBeTruthy();
      expect(screen.getByPlaceholderText("Mot de passe")).toBeTruthy();

      // Removed inputs from the simplification.
      expect(screen.queryByPlaceholderText("Nom d'utilisateur")).toBeNull();
      expect(screen.queryByPlaceholderText("Prénom (optionnel)")).toBeNull();
      expect(screen.queryByPlaceholderText("Nom (optionnel)")).toBeNull();
      expect(
        screen.queryByPlaceholderText("Confirmer le mot de passe"),
      ).toBeNull();

      // Password helper is shown in signup mode (Q2 statu quo on
      // strict policy — display it but don't pre-validate client-side).
      expect(
        screen.getByText(/Au moins 8 caract.+majuscule.+chiffre/),
      ).toBeTruthy();
    });

    it("submits signup with email + password only — backend auto-generates the username", async () => {
      mockSignup.mockResolvedValue(undefined);
      render(<LoginScreen />);

      fireEvent.press(screen.getByText("Créer un compte"));
      fireEvent.changeText(
        screen.getByPlaceholderText("Email"),
        "lea@brasse-bouillon.test",
      );
      fireEvent.changeText(
        screen.getByPlaceholderText("Mot de passe"),
        "StrongPass123!",
      );
      fireEvent.press(screen.getByText("Créer mon compte"));

      await waitFor(() => {
        expect(mockSignup).toHaveBeenCalledWith({
          email: "lea@brasse-bouillon.test",
          password: "StrongPass123!",
        });
      });
    });
  });

  describe("sad path — validation", () => {
    it("rejects signup with missing email or password", async () => {
      render(<LoginScreen />);
      fireEvent.press(screen.getByText("Créer un compte"));
      fireEvent.press(screen.getByText("Créer mon compte"));

      await waitFor(() => {
        expect(screen.getByText("Email et mot de passe requis.")).toBeTruthy();
      });

      expect(mockSignup).not.toHaveBeenCalled();
    });

    it("rejects signup with password shorter than 8 chars", async () => {
      render(<LoginScreen />);
      fireEvent.press(screen.getByText("Créer un compte"));
      fireEvent.changeText(
        screen.getByPlaceholderText("Email"),
        "lea@brasse-bouillon.test",
      );
      fireEvent.changeText(
        screen.getByPlaceholderText("Mot de passe"),
        "short",
      );
      fireEvent.press(screen.getByText("Créer mon compte"));

      await waitFor(() => {
        expect(
          screen.getByText(
            "Le mot de passe doit contenir au moins 8 caractères.",
          ),
        ).toBeTruthy();
      });

      expect(mockSignup).not.toHaveBeenCalled();
    });

    it("rejects login with invalid email format", async () => {
      render(<LoginScreen />);
      fireEvent.changeText(
        screen.getByPlaceholderText("Email"),
        "not-an-email",
      );
      fireEvent.changeText(
        screen.getByPlaceholderText("Mot de passe"),
        "StrongPass123!",
      );
      fireEvent.press(screen.getByText("Se connecter"));

      await waitFor(() => {
        expect(
          screen.getByText("Merci de renseigner un email valide."),
        ).toBeTruthy();
      });

      expect(mockLogin).not.toHaveBeenCalled();
    });
  });

  describe("forgot password (link, not tab)", () => {
    it("opens forgot mode via the link, hides login/signup tabs, shows back link", () => {
      render(<LoginScreen />);
      fireEvent.press(screen.getByText("Mot de passe oublié ?"));

      expect(
        screen.getByText("Reçois un lien de réinitialisation"),
      ).toBeTruthy();
      expect(screen.getByText("← Retour à la connexion")).toBeTruthy();
      // No password field in forgot mode.
      expect(screen.queryByPlaceholderText("Mot de passe")).toBeNull();
    });

    it("submits forgot password request", async () => {
      mockRequestPasswordReset.mockResolvedValue(undefined);
      render(<LoginScreen />);
      fireEvent.press(screen.getByText("Mot de passe oublié ?"));
      fireEvent.changeText(
        screen.getByPlaceholderText("Email"),
        "demo@bb.test",
      );
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
  });

  describe("conditional demo button (Issue #764)", () => {
    it("shows the demo button when EXPO_PUBLIC_USE_DEMO_DATA=true", () => {
      dataSourceMock.useDemoData = true;
      render(<LoginScreen />);
      expect(screen.getByText("Connexion démo")).toBeTruthy();
    });

    it("hides the demo button when EXPO_PUBLIC_USE_DEMO_DATA=false (production / backend mode)", () => {
      dataSourceMock.useDemoData = false;
      render(<LoginScreen />);
      expect(screen.queryByText("Connexion démo")).toBeNull();
    });

    it("triggers demo login when the button is tapped (demo mode)", async () => {
      mockLoginWithDemoAccount.mockResolvedValue(undefined);
      dataSourceMock.useDemoData = true;
      render(<LoginScreen />);

      fireEvent.press(screen.getByText("Connexion démo"));

      await waitFor(() => {
        expect(mockLoginWithDemoAccount).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe("cosmetic Google sign-in button (Issue #765)", () => {
    it("shows the Google button on login mode (above the email input)", () => {
      render(<LoginScreen />);
      expect(screen.getByText("Continuer avec Google")).toBeTruthy();
    });

    it("shows the Google button on signup mode", () => {
      render(<LoginScreen />);
      fireEvent.press(screen.getByText("Créer un compte"));
      expect(screen.getByText("Continuer avec Google")).toBeTruthy();
    });

    it("hides the Google button in forgot-password mode", () => {
      render(<LoginScreen />);
      fireEvent.press(screen.getByText("Mot de passe oublié ?"));
      expect(screen.queryByText("Continuer avec Google")).toBeNull();
    });

    it("opens a 'Bientôt disponible' alert on tap (cosmetic placeholder, no real OAuth)", () => {
      const alertSpy = jest.spyOn(Alert, "alert").mockImplementation(() => {});
      render(<LoginScreen />);
      fireEvent.press(screen.getByText("Continuer avec Google"));

      expect(alertSpy).toHaveBeenCalledWith(
        "Bientôt disponible",
        expect.stringContaining("Google"),
      );
      alertSpy.mockRestore();
    });
  });
});

describe("LoginScreen — keyboard avoidance", () => {
  beforeEach(() => {
    dataSourceMock.useDemoData = true;
  });

  it("wraps the form in a KeyboardAvoidingView so fields stay above the keyboard", () => {
    render(<LoginScreen />);

    expect(screen.UNSAFE_getByType(KeyboardAvoidingView)).toBeTruthy();
  });

  it("exposes return-key actions: email goes to the next field, password submits", () => {
    render(<LoginScreen />);

    expect(screen.getByPlaceholderText("Email").props.returnKeyType).toBe(
      "next",
    );
    expect(
      screen.getByPlaceholderText("Mot de passe").props.returnKeyType,
    ).toBe("go");
  });

  it("moves to the password field when the email return key is pressed", () => {
    render(<LoginScreen />);

    // Runs the email onSubmitEditing handler (focuses the password ref)
    // without dismissing the keyboard; should not throw.
    expect(() =>
      fireEvent(screen.getByPlaceholderText("Email"), "submitEditing"),
    ).not.toThrow();
  });

  it("submits the login when the password return key (go) is pressed", async () => {
    mockLogin.mockResolvedValue(undefined);
    render(<LoginScreen />);

    fireEvent.changeText(
      screen.getByPlaceholderText("Email"),
      "lea@brasse-bouillon.test",
    );
    fireEvent.changeText(
      screen.getByPlaceholderText("Mot de passe"),
      "StrongPass123!",
    );
    fireEvent(screen.getByPlaceholderText("Mot de passe"), "submitEditing");

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith(
        "lea@brasse-bouillon.test",
        "StrongPass123!",
      );
    });
  });
});
