import { fireEvent, render, screen } from "@testing-library/react-native";
import { ScrollView } from "react-native";

import { AcademyHubScreen } from "../AcademyHubScreen";
import React from "react";

const mockPush = jest.fn();

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
      push: mockPush,
      replace: jest.fn(),
      back: jest.fn(),
    }),
  };
});

describe("AcademyHubScreen", () => {
  beforeEach(() => {
    mockPush.mockClear();
  });

  it("renders academy cards without status badges", () => {
    render(<AcademyHubScreen />);

    expect(screen.getByText("Académie brassicole")).toBeTruthy();
    expect(screen.getByText("Référence brassicole structurée")).toBeTruthy();
    expect(screen.getByText("11 ARTICLES")).toBeTruthy();
    expect(screen.getByText("8 CALCULATEURS")).toBeTruthy();
    expect(screen.getByText("Histoire de la bière")).toBeTruthy();
    expect(screen.queryByText("Bientôt")).toBeNull();
    expect(screen.queryByText("Prêt")).toBeNull();
  });

  it("opens history topic details when pressing its card", () => {
    render(<AcademyHubScreen />);

    fireEvent.press(
      screen.getByLabelText("Ouvrir le thème Histoire de la bière"),
    );

    expect(mockPush).toHaveBeenCalledWith({
      pathname: "/(app)/academy/[slug]",
      params: { slug: "histoire" },
    });
  });

  it("filters academy cards from the local search field", () => {
    render(<AcademyHubScreen />);

    fireEvent.changeText(
      screen.getByTestId("academy-search-input"),
      "amertume",
    );

    expect(screen.getByText("Houblons")).toBeTruthy();
    expect(screen.queryByText("Histoire de la bière")).toBeNull();
  });

  it("keeps filtered cards pressable while search input is focused", () => {
    render(<AcademyHubScreen />);

    const scrollViews = screen.UNSAFE_getAllByType(ScrollView);

    expect(scrollViews).toHaveLength(2);
    expect(scrollViews[0]?.props.keyboardShouldPersistTaps).toBe("handled");
    expect(scrollViews[1]?.props.keyboardShouldPersistTaps).toBe("handled");
  });

  it("filters academy cards by focus chip", () => {
    render(<AcademyHubScreen />);

    fireEvent.press(screen.getByTestId("academy-filter-Ingrédients"));

    expect(screen.getByText("Houblons")).toBeTruthy();
    expect(screen.getByText("Malts et fermentescibles")).toBeTruthy();
    expect(screen.queryByText("Eau de brassage")).toBeNull();

    fireEvent.press(screen.getByTestId("academy-filter-all"));

    expect(screen.getByText("Eau de brassage")).toBeTruthy();
  });

  it("clears the academy search field", () => {
    render(<AcademyHubScreen />);

    fireEvent.changeText(screen.getByTestId("academy-search-input"), "zzzz");
    expect(screen.getByText("Aucun résultat")).toBeTruthy();

    fireEvent.press(screen.getByTestId("academy-search-clear"));

    expect(screen.getByText("Histoire de la bière")).toBeTruthy();
    expect(screen.queryByText("Aucun résultat")).toBeNull();
  });
});
