import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react-native";

import { ProfileScreen } from "@/features/auth/presentation/ProfileScreen";
import React from "react";

const mockRefreshProfile = jest.fn();
const mockLogout = jest.fn();
const mockCanGoBack = jest.fn(() => false);
const mockBack = jest.fn();
const mockReplace = jest.fn();
const mockPush = jest.fn();

// expo-router hands back a module-level singleton from `useRouter()`, so the
// router identity is stable across renders. The double must be stable too: a
// fresh object per render would rebuild the focus callback on every render and
// re-run the focus effect on any rerender — something production never does.
const mockRouter = {
  push: mockPush,
  replace: mockReplace,
  back: mockBack,
  canGoBack: mockCanGoBack,
};

// Latest focus callback registered by the screen, so a test can fire a real
// focus event instead of leaning on a rerender.
const mockFocus: { run?: () => void | (() => void) } = {};

jest.mock("@expo/vector-icons", () => ({
  Ionicons: () => null,
}));

// Local expo-router mock: the global one (jest.setup) omits `canGoBack`,
// which ProfileScreen now calls at render to decide whether to show the
// back control. Mirror the global shape and route back/replace to spies.
jest.mock("expo-router", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const react = require("react");
  return {
    useRouter: () => mockRouter,
    // Mirror expo-router: run the callback on mount (first focus) and keep a
    // handle on it so a test can replay it as a later focus event.
    useFocusEffect: (callback: () => void | (() => void)) => {
      mockFocus.run = callback;
      react.useEffect(callback, [callback]);
    },
    useLocalSearchParams: () => ({}),
    usePathname: () => "/",
    Redirect: () => null,
    Stack: ({ children }: { children: React.ReactNode }) => children,
    Tabs: ({ children }: { children: React.ReactNode }) => children,
  };
});

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
    mockCanGoBack.mockReset();
    mockCanGoBack.mockReturnValue(false);
    mockBack.mockReset();
    mockReplace.mockReset();
  });

  it("renders profile information", () => {
    render(<ProfileScreen />);

    // Issue #644 — the screen header is "Mon compte" (renamed from "Profil"
    // when the duplicated "Paramètres globaux" entry was merged into the
    // single account screen).
    expect(screen.getByText("Mon compte")).toBeTruthy();
    expect(screen.queryByText("Profil")).toBeNull();
    expect(screen.getByText("Benoit")).toBeTruthy();
    expect(screen.getByText("brewer@example.com")).toBeTruthy();
    expect(screen.getByText("brewer")).toBeTruthy();
    expect(screen.getByText("user")).toBeTruthy();
  });

  // Guard rail — B-70: the About footer must be mounted on the Profil
  // screen so the jury can verify at a glance which build they are
  // testing. If a future refactor removes the footer, this assertion
  // fails immediately. See docs/product/brainstorms/scan-2026-04-24.md
  // (B-70) for the UX requirement.
  it("mounts the About footer with version / commit / build date", () => {
    render(<ProfileScreen />);

    expect(screen.getByLabelText("À propos de l'application")).toBeTruthy();
    expect(screen.getByTestId("about-footer-version")).toBeTruthy();
    expect(screen.getByTestId("about-footer-commit")).toBeTruthy();
    expect(screen.getByTestId("about-footer-build-date")).toBeTruthy();
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

  // Issue back-buttons — Profil is reachable both as a footer destination
  // (no history) and pushed from the dashboard (has history). The back
  // control must appear only in the pushed case, so a footer-reached tab
  // root stays consistent with the other roots (no stray back button).
  it("shows a back control when reached as a pushed screen (has history)", () => {
    mockCanGoBack.mockReturnValue(true);

    render(<ProfileScreen />);

    expect(screen.getByLabelText("Retour à l'écran précédent")).toBeTruthy();
  });

  it("hides the back control when reached as a tab root (no history)", () => {
    mockCanGoBack.mockReturnValue(false);

    render(<ProfileScreen />);

    expect(screen.queryByLabelText("Retour à l'écran précédent")).toBeNull();
  });

  // Regression — the screen instance stays mounted across tab switches, so a
  // bare render-time `canGoBack()` read would leave the control hidden after
  // history appears. Re-deriving on focus must reveal it on the next focus.
  it("reveals the back control after gaining history on a later focus", () => {
    mockCanGoBack.mockReturnValue(false);

    render(<ProfileScreen />);

    expect(screen.queryByLabelText("Retour à l'écran précédent")).toBeNull();

    // The user now reaches Profile again through a push, so history exists.
    mockCanGoBack.mockReturnValue(true);

    // Replay the focus callback: an actual focus event is the only thing that
    // re-derives this in production. A rerender would NOT do — the router is a
    // stable singleton, so the callback identity never changes and the focus
    // effect never re-fires on a plain re-render.
    act(() => {
      mockFocus.run?.();
    });

    expect(screen.getByLabelText("Retour à l'écran précédent")).toBeTruthy();
  });
});
