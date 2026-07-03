import { fireEvent, render, screen } from "@testing-library/react-native";
import React from "react";

import { academyTopics } from "@/features/tools/data/academy.data";
import { AcademyTopicDetailsScreen } from "../AcademyTopicDetailsScreen";

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

const TOPICS_WITH_CALCULATOR = [
  "fermentescibles",
  "couleur",
  "houblons",
  "eau",
  "rendement",
  "levures",
  "carbonatation",
  "avances",
] as const;

describe("AcademyTopicDetailsScreen — calculator CTA (Issue #616)", () => {
  beforeEach(() => {
    mockPush.mockClear();
  });

  it.each(TOPICS_WITH_CALCULATOR)(
    'happy: %s topic shows "Ouvrir le calculateur" and navigates to its calculator',
    (slug) => {
      render(<AcademyTopicDetailsScreen slugParam={slug} />);

      const button = screen.getByText("Ouvrir le calculateur");
      fireEvent.press(button);

      expect(mockPush).toHaveBeenCalledWith({
        pathname: "/tools/[slug]/calculator",
        params: { slug },
      });
    },
  );

  it('sad: never renders "Accéder au futur calculateur" anywhere', () => {
    for (const slug of TOPICS_WITH_CALCULATOR) {
      const { unmount } = render(
        <AcademyTopicDetailsScreen slugParam={slug} />,
      );
      expect(screen.queryByText(/futur calculateur/i)).toBeNull();
      unmount();
    }
  });

  it("edge: topics without a calculator do not show the calculator CTA", () => {
    for (const slug of ["histoire", "introduction", "glossaire"] as const) {
      const { unmount } = render(
        <AcademyTopicDetailsScreen slugParam={slug} />,
      );
      expect(screen.queryByText("Ouvrir le calculateur")).toBeNull();
      unmount();
    }
  });

  it("edge: every topic with hasCalculator=true is wired to a working calculator route", () => {
    const wired = academyTopics.filter((t) => t.hasCalculator);
    expect(wired.map((t) => t.slug).sort()).toEqual(
      [...TOPICS_WITH_CALCULATOR].sort(),
    );
    for (const topic of wired) {
      expect(topic.status).toBe("ready");
    }
  });

  it("renders the generated published article when the topic has migrated content", () => {
    render(<AcademyTopicDetailsScreen slugParam="houblons" />);

    expect(
      screen.getByText("Reference guide for hop roles in brewing."),
    ).toBeTruthy();
    expect(screen.getByText("Role du houblon")).toBeTruthy();
    expect(screen.getByText("Ouvrir le calculateur")).toBeTruthy();
  });
});
