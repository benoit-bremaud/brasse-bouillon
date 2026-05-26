import { fireEvent, render, screen } from "@testing-library/react-native";

import React from "react";

import { BatchStep } from "@/features/batches/domain/batch.types";
import { StepCard } from "@/features/batches/presentation/StepCard";

jest.mock("@expo/vector-icons", () => ({ Ionicons: () => null }));

function makeStep(overrides: Partial<BatchStep> = {}): BatchStep {
  return {
    batchId: "b-1",
    stepOrder: 0,
    type: "mash",
    label: "Empâtage 67°C",
    status: "in_progress",
    createdAt: "2026-05-19T09:00:00.000Z",
    updatedAt: "2026-05-19T09:00:00.000Z",
    ...overrides,
  };
}

describe("StepCard", () => {
  // Happy path
  it("renders the step number and label", () => {
    render(<StepCard step={makeStep()} onOpenTip={jest.fn()} />);
    expect(screen.getByText("1. Empâtage 67°C")).toBeTruthy();
  });

  // Edge: a step with a tip exposes the ⓘ control and calls back with the tip
  it("opens the tip when the info button is pressed", () => {
    const onOpenTip = jest.fn();
    render(
      <StepCard
        step={makeStep({ pedagogicalTip: "Alpha-amylase à 67°C." })}
        onOpenTip={onOpenTip}
      />,
    );

    fireEvent.press(screen.getByLabelText("Astuce pour l'étape Empâtage 67°C"));
    expect(onOpenTip).toHaveBeenCalledWith({
      label: "Empâtage 67°C",
      tip: "Alpha-amylase à 67°C.",
    });
  });

  // Sad path: no tip → no info control
  it("renders no info button when the step has no tip", () => {
    render(
      <StepCard
        step={makeStep({ pedagogicalTip: null })}
        onOpenTip={jest.fn()}
      />,
    );
    expect(
      screen.queryByLabelText("Astuce pour l'étape Empâtage 67°C"),
    ).toBeNull();
  });
});
