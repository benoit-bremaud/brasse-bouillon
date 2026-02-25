import { fireEvent, render, screen } from "@testing-library/react-native";

import React from "react";
import { AcademyHubScreen } from "../AcademyHubScreen";

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

describe("AcademyHubScreen", () => {
  beforeEach(() => {
    mockPush.mockClear();
  });

  it("renders academy cards without status badges", () => {
    render(<AcademyHubScreen />);

    expect(screen.getByText("Académie brassicole")).toBeTruthy();
    expect(screen.getByText("Histoire de la bière")).toBeTruthy();
    expect(screen.queryByText("Bientôt")).toBeNull();
    expect(screen.queryByText("Prêt")).toBeNull();
  });

  it("opens coming-soon topic details when pressing its card", () => {
    render(<AcademyHubScreen />);

    fireEvent.press(
      screen.getByLabelText("Ouvrir le thème Histoire de la bière"),
    );

    expect(mockPush).toHaveBeenCalledWith({
      pathname: "/(app)/academy/[slug]",
      params: { slug: "histoire" },
    });
  });
});
