import { fireEvent, render, screen } from "@testing-library/react-native";

import React from "react";

import { ChecklistRow } from "@/core/ui/ChecklistRow";

jest.mock("@expo/vector-icons", () => ({
  Ionicons: () => null,
}));

describe("ChecklistRow", () => {
  it("renders the label and meta", () => {
    render(
      <ChecklistRow
        label="Pilsner Malt"
        meta="0.9 kg"
        checked={false}
        onToggle={jest.fn()}
      />,
    );

    expect(screen.getByText("Pilsner Malt")).toBeTruthy();
    expect(screen.getByText("0.9 kg")).toBeTruthy();
  });

  it("calls onToggle when pressed", () => {
    const onToggle = jest.fn();
    render(
      <ChecklistRow
        label="Cascade"
        checked={false}
        onToggle={onToggle}
        testID="row-cascade"
      />,
    );

    fireEvent.press(screen.getByTestId("row-cascade"));
    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it("exposes the checked state for accessibility", () => {
    render(
      <ChecklistRow
        label="US-05"
        checked
        onToggle={jest.fn()}
        testID="row-yeast"
      />,
    );

    expect(screen.getByTestId("row-yeast").props.accessibilityState).toEqual({
      checked: true,
    });
  });
});
