import { fireEvent, render, screen } from "@testing-library/react-native";

import React from "react";
import { ShopScreen } from "@/features/shop/presentation/ShopScreen";

const mockPush = jest.fn();

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

describe("ShopScreen", () => {
  beforeEach(() => {
    mockPush.mockClear();
  });

  it("renders shop header with title and subtitle", () => {
    render(<ShopScreen />);

    expect(screen.getByText("Ma Boutique")).toBeTruthy();
    expect(screen.getByText("Tout pour brasser chez vous")).toBeTruthy();
  });

  it("renders all category cards", () => {
    render(<ShopScreen />);

    expect(screen.getByText("Malts")).toBeTruthy();
    expect(screen.getByText("Houblons")).toBeTruthy();
    expect(screen.getByText("Levures")).toBeTruthy();
    expect(screen.getByText("Kits")).toBeTruthy();
    expect(screen.getByText("L'Office 🍽️")).toBeTruthy();
    expect(screen.getByText("L'Épicerie 🌶️")).toBeTruthy();
  });

  it("navigates to category screen when card is pressed", () => {
    render(<ShopScreen />);

    const maltsCard = screen.getByLabelText("Ouvrir la catégorie Malts");
    fireEvent.press(maltsCard);

    expect(mockPush).toHaveBeenCalledWith({
      pathname: "/(app)/shop/[category]",
      params: { category: "malts" },
    });
  });

  it("renders coming soon info card", () => {
    render(<ShopScreen />);

    expect(
      screen.getByText(/Bientôt disponible : commande en ligne/),
    ).toBeTruthy();
  });
});
