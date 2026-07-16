import { render, screen } from "@testing-library/react-native";

import React from "react";
import { ShopScreen } from "@/features/shop/presentation/ShopScreen";

jest.mock("@expo/vector-icons", () => {
  return {
    Ionicons: () => null,
  };
});

describe("ShopScreen", () => {
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

  // The header carries no Academy shortcut: the cross-link was unrelated to
  // shopping and its pill was clipped off the right screen edge on device.
  it("offers no Academy shortcut", () => {
    render(<ShopScreen />);

    expect(screen.queryByLabelText("Accéder à l'Académie")).toBeNull();
  });
});
