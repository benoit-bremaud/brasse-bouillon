/**
 * Tests cover happy path (default render exposes the progressbar role
 * and the lottie view), variant sizes (small/medium/large pass the right
 * pixel dimensions to LottieView), sad path (no message prop hides the
 * caption), and edge case (custom accessibilityLabel overrides the
 * default "Chargement en cours").
 */

import { render, screen } from "@testing-library/react-native";
import React from "react";

import { BeerMugLoader } from "@/core/ui/BeerMugLoader";

jest.mock("lottie-react-native", () => ({
  __esModule: true,
  default: ({ testID, style }: { testID?: string; style?: object }) => {
    const { View } = jest.requireActual("react-native");
    return <View testID={testID} style={style} />;
  },
}));

describe("BeerMugLoader", () => {
  it("happy path — renders with default accessibility role and label", () => {
    render(<BeerMugLoader />);

    const loader = screen.getByTestId("beer-mug-loader");
    expect(loader).toBeTruthy();
    expect(loader.props.accessibilityRole).toBe("progressbar");
    expect(loader.props.accessibilityLabel).toBe("Chargement en cours");
    expect(screen.getByTestId("beer-mug-loader-lottie")).toBeTruthy();
  });

  it("happy path — medium is the default size (48px)", () => {
    render(<BeerMugLoader />);

    const lottie = screen.getByTestId("beer-mug-loader-lottie");
    expect(lottie.props.style).toEqual({ width: 48, height: 48 });
  });

  it.each([
    ["small", 24],
    ["medium", 48],
    ["large", 96],
  ] as const)("variant — %s renders at %dpx", (size, expectedPx) => {
    render(<BeerMugLoader size={size} />);

    const lottie = screen.getByTestId("beer-mug-loader-lottie");
    expect(lottie.props.style).toEqual({
      width: expectedPx,
      height: expectedPx,
    });
  });

  it("sad path — no message prop means no caption is rendered", () => {
    render(<BeerMugLoader />);

    expect(screen.queryByTestId("beer-mug-loader-message")).toBeNull();
  });

  it("happy path — message prop renders the caption text", () => {
    render(<BeerMugLoader message="Authentification en cours..." />);

    const message = screen.getByTestId("beer-mug-loader-message");
    expect(message).toBeTruthy();
    expect(screen.getByText("Authentification en cours...")).toBeTruthy();
  });

  it("edge case — custom accessibilityLabel overrides the default", () => {
    render(<BeerMugLoader accessibilityLabel="Authentification en cours" />);

    const loader = screen.getByTestId("beer-mug-loader");
    expect(loader.props.accessibilityLabel).toBe("Authentification en cours");
  });

  it("edge case — custom testID is propagated to root and lottie", () => {
    render(<BeerMugLoader testID="login-loader" />);

    expect(screen.getByTestId("login-loader")).toBeTruthy();
    expect(screen.getByTestId("login-loader-lottie")).toBeTruthy();
  });
});
