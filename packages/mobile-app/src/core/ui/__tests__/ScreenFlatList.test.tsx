import { StyleSheet, Text } from "react-native";
import { render, screen } from "@testing-library/react-native";
import React from "react";

import { navBar } from "@/core/theme";
import { ScreenFlatList } from "@/core/ui/ScreenFlatList";

const BOTTOM_INSET = 34;

jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 34, left: 0 }),
}));

const styles = StyleSheet.create({
  content: { paddingBottom: 4, paddingHorizontal: 16 },
});

function flatten(): Record<string, unknown> {
  const list = screen.getByTestId("list");
  return StyleSheet.flatten(list.props.contentContainerStyle) as Record<
    string,
    unknown
  >;
}

function renderList() {
  render(
    <ScreenFlatList
      testID="list"
      data={["a", "b"]}
      keyExtractor={(item) => item}
      renderItem={({ item }) => <Text>{item}</Text>}
      contentContainerStyle={styles.content}
    />,
  );
}

describe("ScreenFlatList", () => {
  it("reserves the nav-bar clearance so the last row clears the flush bar", () => {
    renderList();

    expect(flatten().paddingBottom).toBe(navBar.height + BOTTOM_INSET);
  });

  it("keeps the caller's own content styles", () => {
    renderList();

    expect(flatten().paddingHorizontal).toBe(16);
  });

  // Sad path, mirroring ScreenScrollView: a caller's paddingBottom must never
  // win over the clearance (audit finding M1 — the per-screen opt-in is exactly
  // what let controls end up under the bar).
  it("overrides a caller's paddingBottom rather than letting it win", () => {
    renderList();

    expect(flatten().paddingBottom).not.toBe(4);
  });

  it("still renders its rows", () => {
    renderList();

    expect(screen.getByText("a")).toBeTruthy();
    expect(screen.getByText("b")).toBeTruthy();
  });
});
