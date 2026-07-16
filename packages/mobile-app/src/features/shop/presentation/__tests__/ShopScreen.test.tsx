import { render, screen } from "@testing-library/react-native";

import React from "react";
import { ShopScreen } from "@/features/shop/presentation/ShopScreen";

jest.mock("@expo/vector-icons", () => {
  return {
    Ionicons: () => null,
  };
});

describe("ShopScreen", () => {
  it("renders the coming-soon placeholder with all six category previews", () => {
    render(<ShopScreen />);

    expect(screen.getByText("Ma Boutique")).toBeTruthy();
    expect(screen.getByText("Tout pour brasser chez vous")).toBeTruthy();
    expect(screen.getByText(/La boutique arrive bientôt/)).toBeTruthy();
    expect(screen.getByText("Malts")).toBeTruthy();
    expect(screen.getByText("Houblons")).toBeTruthy();
    expect(screen.getByText("Levures")).toBeTruthy();
    expect(screen.getByText("Kits")).toBeTruthy();
    expect(screen.getByText("Matériel")).toBeTruthy();
    expect(screen.getByText("Accessoires")).toBeTruthy();
  });

  // Guards the decision this screen exists to express (#1444): while shop
  // commerce is deferred, the shop promises nothing it cannot deliver — the
  // category tiles are previews, not entry points, and there is no cart.
  // A pressable appearing here means an affordance crept back in, so this
  // must fail loudly and be re-decided rather than quietly amended.
  it("exposes no pressable affordance while commerce is deferred", () => {
    render(<ShopScreen />);

    expect(screen.queryAllByRole("button")).toHaveLength(0);
  });

  // The same decision, from the money angle: #1444 deleted a catalog of
  // invented prices. No price may render until real products exist.
  it("displays no price", () => {
    render(<ShopScreen />);

    expect(screen.queryByText(/€/)).toBeNull();
  });
});
