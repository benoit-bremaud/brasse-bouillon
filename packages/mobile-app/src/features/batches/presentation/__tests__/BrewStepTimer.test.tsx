import { render, screen } from "@testing-library/react-native";

import React from "react";

import { BatchStep } from "@/features/batches/domain/batch.types";
import { BrewStepTimer } from "@/features/batches/presentation/BrewStepTimer";

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

describe("BrewStepTimer", () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  // Happy path: a step with a planned duration shows the timer card.
  it("renders the countdown card for a step with a planned duration", () => {
    render(
      <BrewStepTimer step={makeStep({ plannedDurationMin: 30 })} useDemoData />,
    );

    expect(screen.getByText("Minuterie d'étape")).toBeTruthy();
    expect(screen.getByText("Empâtage 67°C")).toBeTruthy();
    expect(screen.getByText("restantes")).toBeTruthy();
    // Demo anchors ~60% elapsed of 30 min → "18 / 30 min" scale hint.
    expect(screen.getByText(/\/ 30 min$/)).toBeTruthy();
    // MM:SS countdown is shown.
    expect(screen.getByText(/^\d{2}:\d{2}$/)).toBeTruthy();
  });

  // Sad path: no planned duration → the timer renders nothing (fermentation,
  // legacy steps use the day-based tracker instead).
  it("renders nothing when the step has no planned duration", () => {
    render(
      <BrewStepTimer
        step={makeStep({ plannedDurationMin: null })}
        useDemoData
      />,
    );

    expect(screen.queryByText("Minuterie d'étape")).toBeNull();
  });
});
