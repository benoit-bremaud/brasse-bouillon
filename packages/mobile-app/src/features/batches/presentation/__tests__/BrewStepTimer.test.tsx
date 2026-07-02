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

  // A live 60-min step whose startedAt puts the countdown at `remainingMin`.
  function liveStepAt(remainingMin: number): BatchStep {
    return makeStep({
      plannedDurationMin: 60,
      startedAt: new Date(
        Date.now() - (60 - remainingMin) * 60 * 1000,
      ).toISOString(),
    });
  }

  const NEXT_STEP = makeStep({
    stepOrder: 1,
    type: "boil",
    label: "Ébullition",
    prepActions: [
      { action: "Retire le sac de grain.", why: "Il ne doit pas cuire." },
    ],
  });

  it("announces the next step's PRÉP inside the T-minus window (F9a, happy)", () => {
    render(
      <BrewStepTimer
        step={liveStepAt(4)}
        useDemoData={false}
        nextStep={NEXT_STEP}
      />,
    );

    expect(screen.getByText("Bientôt : Ébullition")).toBeTruthy();
    expect(
      screen.getByText(/Profites-en pour préparer .*Retire le sac de grain/),
    ).toBeTruthy();
    // The countdown keeps running — the announce complements it.
    expect(screen.getByText("restantes")).toBeTruthy();
  });

  it("stays silent outside the T-minus window (F9a, edge)", () => {
    render(
      <BrewStepTimer
        step={liveStepAt(6)}
        useDemoData={false}
        nextStep={NEXT_STEP}
      />,
    );

    expect(screen.queryByText(/Bientôt/)).toBeNull();
  });

  it("announces nothing on the last step (F9a, edge)", () => {
    render(
      <BrewStepTimer
        step={liveStepAt(4)}
        useDemoData={false}
        nextStep={null}
      />,
    );

    expect(screen.queryByText(/Bientôt/)).toBeNull();
  });

  it("switches to a calm elapsed state at 00:00 and hands off to the end condition (F9a)", () => {
    render(
      <BrewStepTimer
        step={{ ...liveStepAt(-1), doneWhen: "Quand les ~60 min sont là." }}
        useDemoData={false}
        nextStep={NEXT_STEP}
      />,
    );

    expect(screen.getByText("Temps écoulé")).toBeTruthy();
    expect(
      screen.getByText(/Vérifie la condition de fin ci-dessous/),
    ).toBeTruthy();
    // No running countdown, and the announce yields to the hand-off (the next
    // step's PRÉP will greet the brewer right after Terminer anyway).
    expect(screen.queryByText("restantes")).toBeNull();
    expect(screen.queryByText(/Bientôt/)).toBeNull();
  });

  it("elapsed on a legacy step points nowhere — no doneWhen card exists (F9a, edge)", () => {
    render(
      <BrewStepTimer
        step={liveStepAt(-1)}
        useDemoData={false}
        nextStep={null}
      />,
    );

    expect(screen.getByText("Temps écoulé")).toBeTruthy();
    // The hint must not reference a card that is not on the screen.
    expect(screen.queryByText(/condition de fin ci-dessous/)).toBeNull();
    expect(screen.getByText(/Termine l'étape quand c'est bon/)).toBeTruthy();
  });
});
