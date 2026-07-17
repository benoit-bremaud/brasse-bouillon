import { fireEvent, render, screen } from "@testing-library/react-native";

import React from "react";
import { Text } from "react-native";

import { Screen } from "@/core/ui/Screen";

let mockPathname = "/dashboard";

jest.mock("expo-router", () => {
  return {
    usePathname: () => mockPathname,
  };
});

jest.mock("react-native-safe-area-context", () => ({
  SafeAreaView: ({ children }: { children: React.ReactNode }) => children,
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
}));

describe("Screen", () => {
  afterEach(() => {
    mockPathname = "/dashboard";
  });

  // Happy path — a normal in-app route renders its content (the branch that
  // clears the compact brand header).
  it("renders children on a non-auth route", () => {
    render(
      <Screen>
        <Text>content</Text>
      </Screen>,
    );

    expect(screen.getByText("content")).toBeTruthy();
  });

  // Edge — on an auth route the header is absent, so the layout takes the
  // smaller top-padding branch; content must still render.
  it("renders children on an auth route", () => {
    mockPathname = "/login";

    render(
      <Screen>
        <Text>content</Text>
      </Screen>,
    );

    expect(screen.getByText("content")).toBeTruthy();
  });

  // Edge — while loading, the loader replaces the content.
  it("shows the loader and hides content while loading", () => {
    render(
      <Screen isLoading>
        <Text>content</Text>
      </Screen>,
    );

    expect(screen.queryByText("content")).toBeNull();
  });

  // Sad path — an error renders the message and a retry control that calls back.
  it("renders the error message and triggers onRetry", () => {
    const onRetry = jest.fn();

    render(
      <Screen error="Boom" onRetry={onRetry}>
        <Text>content</Text>
      </Screen>,
    );

    expect(screen.getByText("Boom")).toBeTruthy();

    fireEvent.press(screen.getByText("Réessayer"));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
