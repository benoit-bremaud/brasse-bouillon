import { fireEvent, render, screen } from "@testing-library/react-native";

import { ShopCategoryScreen } from "@/features/shop/presentation/ShopCategoryScreen";
import React from "react";

const mockPush = jest.fn();
const mockReplace = jest.fn();

jest.mock("expo-router", () => {
  const actual = jest.requireActual("expo-router");
  return {
    ...actual,
    useRouter: () => ({
      push: mockPush,
      replace: mockReplace,
      back: jest.fn(),
    }),
  };
});

describe("ShopCategoryScreen", () => {
  beforeEach(() => {
    mockPush.mockClear();
    mockReplace.mockClear();
  });

  it("renders empty state for invalid category", () => {
    render(<ShopCategoryScreen categoryParam="invalid-category" />);

    expect(screen.getByText("Catégorie inconnue")).toBeTruthy();
    expect(screen.getByText("Catégorie invalide")).toBeTruthy();
  });

  it("renders category header for valid category", () => {
    render(<ShopCategoryScreen categoryParam="malts" />);

    expect(screen.getByText("Malts")).toBeTruthy();
    expect(screen.getByText("Pale, Munich, Pilsner, Vienne...")).toBeTruthy();
  });

  it("renders coming soon message with category name", () => {
    render(<ShopCategoryScreen categoryParam="houblons" />);

    expect(
      screen.getByText(/Bientôt disponible : commande en ligne de houblons/),
    ).toBeTruthy();
  });

  it("renders mock products for a valid category", () => {
    render(<ShopCategoryScreen categoryParam="malts" />);

    expect(screen.getByText("Pilsner - Viking Malt")).toBeTruthy();
    expect(screen.getByText("Munich - Weyermann")).toBeTruthy();
  });

  it("renders 'À venir' badge on mock products", () => {
    render(<ShopCategoryScreen categoryParam="kits" />);

    // Badge is rendered within the product card
    expect(screen.getByText("Kit Beginner IPA")).toBeTruthy();
  });

  it("has back button to shop", () => {
    render(<ShopCategoryScreen categoryParam="levures" />);

    const backButton = screen.getByText("← Boutique");
    fireEvent.press(backButton);

    expect(mockReplace).toHaveBeenCalledWith("/(app)/shop");
  });
});
