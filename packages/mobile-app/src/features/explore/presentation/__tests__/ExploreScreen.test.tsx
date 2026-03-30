import { fireEvent, render, screen } from "@testing-library/react-native";

import { ExploreScreen } from "@/features/explore/presentation/ExploreScreen";
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

describe("ExploreScreen", () => {
  beforeEach(() => {
    mockPush.mockClear();
  });

  it("renders discovery positioning and themed spaces", () => {
    render(<ExploreScreen />);

    expect(screen.getByText("Explorer")).toBeTruthy();
    expect(screen.getByText("Pourquoi cet espace ?")).toBeTruthy();
    expect(screen.getByText("Le Puits 💧")).toBeTruthy();
    expect(screen.getByText("L'Épicerie 🌶️")).toBeTruthy();
    expect(screen.getByText("L'Office 🍽️")).toBeTruthy();
  });

  it("opens themed discovery destinations", () => {
    render(<ExploreScreen />);

    fireEvent.press(screen.getByLabelText("Ouvrir Le Puits 💧"));
    expect(mockPush).toHaveBeenCalledWith({
      pathname: "/(app)/tools/[slug]/calculator",
      params: { slug: "eau" },
    });

    fireEvent.press(screen.getByLabelText("Ouvrir L'Épicerie 🌶️"));
    expect(mockPush).toHaveBeenCalledWith({
      pathname: "/(app)/shop/[category]",
      params: { category: "accessoires" },
    });

    fireEvent.press(screen.getByLabelText("Ouvrir L'Office 🍽️"));
    expect(mockPush).toHaveBeenCalledWith("/(app)/equipment");
  });
});
