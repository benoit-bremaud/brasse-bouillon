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
});
