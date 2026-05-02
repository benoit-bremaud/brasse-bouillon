import { fireEvent, render, screen } from "@testing-library/react-native";

import { NavigationFooter } from "@/core/ui/NavigationFooter";
import React from "react";

const mockReplace = jest.fn();

let mockPathname = "/dashboard";

jest.mock("@expo/vector-icons", () => {
  return {
    Ionicons: () => null,
  };
});

jest.mock("expo-router", () => {
  const actual = jest.requireActual("expo-router");
  return {
    ...actual,
    useRouter: () => ({
      replace: mockReplace,
      push: jest.fn(),
      back: jest.fn(),
    }),
    usePathname: () => mockPathname,
  };
});

jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  }),
}));

describe("NavigationFooter", () => {
  beforeEach(() => {
    mockReplace.mockReset();
    mockPathname = "/dashboard";
  });

  it("navigates to selected route when pressing an item", () => {
    render(<NavigationFooter />);

    fireEvent.press(screen.getByLabelText("Recettes"));

    expect(mockReplace).toHaveBeenCalledWith("/recipes");
  });

  it("marks dashboard item as active on dashboard route", () => {
    mockPathname = "/dashboard";

    render(<NavigationFooter />);

    expect(screen.getByLabelText("Accueil")).toHaveAccessibilityState({
      selected: true,
    });
    expect(screen.getByLabelText("Recettes")).toHaveAccessibilityState({
      selected: false,
    });
  });

  it("keeps section item active on sub-routes", () => {
    mockPathname = "/recipes/abc123";

    render(<NavigationFooter />);

    expect(screen.getByLabelText("Recettes")).toHaveAccessibilityState({
      selected: true,
    });
    expect(screen.getByLabelText("Accueil")).toHaveAccessibilityState({
      selected: false,
    });
  });

  it("marks ingredients-related routes as inactive for footer items", () => {
    mockPathname = "/ingredients/malt";

    render(<NavigationFooter />);

    // Issue #613 — the footer's six items are Accueil, Brassins,
    // Recettes, Scan, Académie, Profil (Boutique + Outils were
    // demoted to the dashboard "Voir plus" sheet).
    expect(screen.getByLabelText("Accueil")).toHaveAccessibilityState({
      selected: false,
    });
    expect(screen.getByLabelText("Brassins")).toHaveAccessibilityState({
      selected: false,
    });
    expect(screen.getByLabelText("Recettes")).toHaveAccessibilityState({
      selected: false,
    });
    expect(screen.getByLabelText("Scan")).toHaveAccessibilityState({
      selected: false,
    });
    expect(screen.getByLabelText("Académie")).toHaveAccessibilityState({
      selected: false,
    });
    expect(screen.getByLabelText("Profil")).toHaveAccessibilityState({
      selected: false,
    });
  });

  // Issue #613 — Boutique and Outils are no longer permanent tabs.
  // Regression guard: their accessibility labels must NOT render in
  // the footer.
  it("no longer renders Boutique or Outils in the footer", () => {
    render(<NavigationFooter />);

    expect(screen.queryByLabelText("Boutique")).toBeNull();
    expect(screen.queryByLabelText("Outils")).toBeNull();
  });

  // Issue #613 — Scan is a new permanent tab pointing at the
  // existing /dashboard/scan route. Tapping it must replace into
  // that path.
  it("navigates to /dashboard/scan when pressing Scan", () => {
    render(<NavigationFooter />);

    fireEvent.press(screen.getByLabelText("Scan"));

    expect(mockReplace).toHaveBeenCalledWith("/dashboard/scan");
  });

  // Issue #613 — Profil is a new permanent tab pointing at
  // /profile (the Mon compte screen, see PR #831).
  it("navigates to /profile when pressing Profil", () => {
    render(<NavigationFooter />);

    fireEvent.press(screen.getByLabelText("Profil"));

    expect(mockReplace).toHaveBeenCalledWith("/profile");
  });

  // Issue #613 prefix-collision regression guard. On
  // pathname /dashboard/scan, both Accueil (prefix /dashboard) and
  // Scan (prefix /dashboard/scan) match the active-prefix test.
  // The footer must pick the most specific match (Scan), not the
  // first-declared (Accueil).
  it("activates Scan (not Accueil) on /dashboard/scan", () => {
    mockPathname = "/dashboard/scan";

    render(<NavigationFooter />);

    expect(screen.getByLabelText("Scan")).toHaveAccessibilityState({
      selected: true,
    });
    expect(screen.getByLabelText("Accueil")).toHaveAccessibilityState({
      selected: false,
    });
  });

  // Issue #613 — Profil active on /profile AND on its sub-routes
  // (e.g. /profile/settings if/when sub-routes ship). The footer
  // contract is "stay highlighted as long as we are inside the
  // section", and the helper `isFooterItemActive` already handles
  // the `pathname.startsWith(prefix + "/")` half — this test pins
  // both halves so a future regression on either side fails loudly.
  it("activates Profil on /profile and its sub-routes", () => {
    mockPathname = "/profile";
    const exactRender = render(<NavigationFooter />);
    expect(screen.getByLabelText("Profil")).toHaveAccessibilityState({
      selected: true,
    });
    exactRender.unmount();

    mockPathname = "/profile/settings";
    render(<NavigationFooter />);
    expect(screen.getByLabelText("Profil")).toHaveAccessibilityState({
      selected: true,
    });
  });
});
