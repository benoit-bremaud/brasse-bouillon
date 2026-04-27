import { render, screen } from "@testing-library/react-native";
import React from "react";

import { BeerHero } from "@/features/scan/presentation/components/BeerHero";

describe("BeerHero", () => {
  it("renders name, brewery, and style", () => {
    render(
      <BeerHero name="Punk IPA" brewery="BrewDog" style="IPA" colorEbc={14} />,
    );

    expect(screen.getByText("Punk IPA")).toBeTruthy();
    expect(screen.getByText("BrewDog")).toBeTruthy();
    expect(screen.getByText("IPA")).toBeTruthy();
  });

  it("exposes a combined accessibility label", () => {
    render(
      <BeerHero name="Punk IPA" brewery="BrewDog" style="IPA" colorEbc={14} />,
    );

    const header = screen.getByRole("header");
    expect(header.props.accessibilityLabel).toBe("Punk IPA, BrewDog, IPA");
  });

  it("renders without crashing when colorEbc is null", () => {
    render(
      <BeerHero
        name="Mystery Beer"
        brewery="Unknown"
        style="Unknown"
        colorEbc={null}
      />,
    );

    expect(screen.getByText("Mystery Beer")).toBeTruthy();
  });
});
