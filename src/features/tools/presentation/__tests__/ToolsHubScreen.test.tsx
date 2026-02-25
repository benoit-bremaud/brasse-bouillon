import { fireEvent, render, screen } from "@testing-library/react-native";

import React from "react";
import { ToolsHubScreen } from "../ToolsHubScreen";

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

describe("ToolsHubScreen", () => {
  beforeEach(() => {
    mockPush.mockClear();
  });

  it("renders calculator hub title and known calculator topics", () => {
    render(<ToolsHubScreen />);

    expect(screen.getByText("Calculateurs")).toBeTruthy();
    expect(screen.getByText("Alcool & Densité")).toBeTruthy();
    expect(screen.getByText("Couleur")).toBeTruthy();
    expect(screen.getByText("Eau")).toBeTruthy();
  });

  it("opens a calculator card action", () => {
    render(<ToolsHubScreen />);

    const cardAction = screen.getByLabelText(
      "Ouvrir le calculateur Alcool & Densité",
    );

    fireEvent.press(cardAction);

    expect(mockPush).toHaveBeenCalledWith({
      pathname: "/(app)/tools/[slug]/calculator",
      params: { slug: "fermentescibles" },
    });
  });
});
