import { render, screen } from "@testing-library/react-native";
import React from "react";

import { AcademyTopicLearnRouteScreen } from "../academy-tools-routing";

const mockRedirect = jest.fn();

jest.mock("@expo/vector-icons", () => ({ Ionicons: () => null }));

jest.mock("expo-router", () => {
  const actual = jest.requireActual("expo-router");

  return {
    ...actual,
    Redirect: ({ href }: { href: unknown }) => {
      mockRedirect(href);
      return null;
    },
    useRouter: () => ({
      push: jest.fn(),
      replace: jest.fn(),
      back: jest.fn(),
      canGoBack: () => true,
    }),
  };
});

describe("AcademyTopicLearnRouteScreen", () => {
  beforeEach(() => {
    mockRedirect.mockClear();
  });

  it("redirects a published article's learn deep link to the article route", () => {
    render(<AcademyTopicLearnRouteScreen slugParam="histoire" />);

    expect(mockRedirect).toHaveBeenCalledWith({
      pathname: "/(app)/academy/[slug]",
      params: { slug: "histoire" },
    });
  });

  it("sad: keeps the coming-soon placeholder for a slug without a published article", () => {
    render(<AcademyTopicLearnRouteScreen slugParam="__unknown__" />);

    expect(mockRedirect).not.toHaveBeenCalled();
    expect(screen.getByText("Impossible d'ouvrir cette page")).toBeTruthy();
  });

  it("edge: renders the placeholder without redirecting when the slug is missing", () => {
    render(<AcademyTopicLearnRouteScreen slugParam={undefined} />);

    expect(mockRedirect).not.toHaveBeenCalled();
  });
});
