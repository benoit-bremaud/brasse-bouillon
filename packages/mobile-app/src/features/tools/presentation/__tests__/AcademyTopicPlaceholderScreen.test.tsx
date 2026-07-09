import { fireEvent, render, screen } from "@testing-library/react-native";
import React from "react";

import { AcademyTopicPlaceholderScreen } from "../AcademyTopicPlaceholderScreen";

const mockPush = jest.fn();
const mockReplace = jest.fn();
const mockBack = jest.fn();
const mockCanGoBack = jest.fn(() => true);

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
      replace: mockReplace,
      back: mockBack,
      canGoBack: mockCanGoBack,
    }),
  };
});

describe("AcademyTopicPlaceholderScreen", () => {
  beforeEach(() => {
    mockPush.mockClear();
    mockReplace.mockClear();
    mockBack.mockClear();
    mockCanGoBack.mockReset();
    mockCanGoBack.mockReturnValue(true);
  });

  it("navigates back to the topic details route from a placeholder article", () => {
    render(<AcademyTopicPlaceholderScreen slugParam="histoire" mode="learn" />);

    fireEvent.press(screen.getByText("Retour à la fiche thématique"));

    expect(mockPush).toHaveBeenCalledWith({
      pathname: "/(app)/academy/[slug]",
      params: { slug: "histoire" },
    });
  });

  it("sad: renders the empty state and returns to the hub for an unknown topic", () => {
    render(
      <AcademyTopicPlaceholderScreen slugParam="__unknown__" mode="learn" />,
    );

    expect(screen.getByText("Impossible d'ouvrir cette page")).toBeTruthy();

    fireEvent.press(screen.getByText("Retour à l'académie"));

    expect(mockReplace).toHaveBeenCalledWith("/(app)/academy");
  });

  it("edge: uses navigation back from the header when history exists", () => {
    mockCanGoBack.mockReturnValue(true);

    render(<AcademyTopicPlaceholderScreen slugParam="histoire" mode="learn" />);

    fireEvent.press(screen.getByLabelText("Retour à l'écran précédent"));

    expect(mockBack).toHaveBeenCalledTimes(1);
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it("edge: falls back to the academy hub from the header without history", () => {
    mockCanGoBack.mockReturnValue(false);

    render(<AcademyTopicPlaceholderScreen slugParam="histoire" mode="learn" />);

    fireEvent.press(screen.getByLabelText("Retour à l'écran précédent"));

    expect(mockBack).not.toHaveBeenCalled();
    expect(mockReplace).toHaveBeenCalledWith("/(app)/academy");
  });

  it("edge: renders the calculator placeholder variant for mode=calculator", () => {
    render(
      <AcademyTopicPlaceholderScreen slugParam="histoire" mode="calculator" />,
    );

    expect(
      screen.getByText("Le calculateur thématique arrive bientôt."),
    ).toBeTruthy();
    expect(screen.getByText("Calculateur")).toBeTruthy();
  });
});
