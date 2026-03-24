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

    expect(screen.getByLabelText("Accueil")).toHaveAccessibilityState({
      selected: false,
    });
    expect(screen.getByLabelText("Brassins")).toHaveAccessibilityState({
      selected: false,
    });
    expect(screen.getByLabelText("Recettes")).toHaveAccessibilityState({
      selected: false,
    });
    expect(screen.getByLabelText("Boutique")).toHaveAccessibilityState({
      selected: false,
    });
    expect(screen.getByLabelText("Outils")).toHaveAccessibilityState({
      selected: false,
    });
    expect(screen.getByLabelText("Académie")).toHaveAccessibilityState({
      selected: false,
    });
  });
});
