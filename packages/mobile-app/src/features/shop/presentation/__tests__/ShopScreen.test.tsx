import { fireEvent, render, screen } from "@testing-library/react-native";

import React from "react";
import { ShopScreen } from "@/features/shop/presentation/ShopScreen";

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

describe("ShopScreen", () => {
  beforeEach(() => {
    mockPush.mockClear();
  });

  it("renders shop header with title and subtitle", () => {
    render(<ShopScreen />);

    expect(screen.getByText("Ma Boutique")).toBeTruthy();
    expect(screen.getByText("Tout pour brasser chez vous")).toBeTruthy();
  });

  it("renders all category preview tiles with sober labels", () => {
    render(<ShopScreen />);

    expect(screen.getByText("Malts")).toBeTruthy();
    expect(screen.getByText("Houblons")).toBeTruthy();
    expect(screen.getByText("Levures")).toBeTruthy();
    expect(screen.getByText("Kits")).toBeTruthy();
    expect(screen.getByText("Matériel")).toBeTruthy();
    expect(screen.getByText("Accessoires")).toBeTruthy();
  });

  it("renders the honest coming-soon message", () => {
    render(<ShopScreen />);

    expect(screen.getByText(/La boutique arrive bientôt/)).toBeTruthy();
  });

  it("navigates to the Academy from the header shortcut", () => {
    render(<ShopScreen />);

    fireEvent.press(screen.getByLabelText("Accéder à l'Académie"));

    expect(mockPush).toHaveBeenCalledWith("/(app)/academy");
  });
});
