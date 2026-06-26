import { fireEvent, render, screen } from "@testing-library/react-native";

import { BatchClosureView } from "@/features/batches/presentation/BatchClosureView";
import { Batch } from "@/features/batches/domain/batch.types";
import { Tasting } from "@/features/batches/domain/bottling.types";

jest.mock("@expo/vector-icons", () => ({
  Ionicons: () => null,
}));

const TS = "2026-06-20T09:00:00.000Z";

const completedBatch: Batch = {
  id: "b1deadbeef-cafe",
  ownerId: "u1",
  recipeId: "r1",
  status: "completed",
  currentStepOrder: null,
  startedAt: "2026-02-05T09:00:00.000Z",
  bottledAt: TS,
  completedAt: TS,
  createdAt: "2026-02-05T09:00:00.000Z",
  updatedAt: TS,
  steps: [],
};

const recordedTasting: Tasting = {
  id: "t1",
  batchId: "b1deadbeef-cafe",
  rating: 4,
  note: "Belle mousse, finale fruitée.",
  createdAt: TS,
};

describe("BatchClosureView", () => {
  const onRateTasting = jest.fn();

  beforeEach(() => {
    onRateTasting.mockReset();
  });

  // Happy path: no tasting yet → CTA is present and fires the handler.
  it("shows the rate CTA when no tasting exists and fires it on press", () => {
    render(
      <BatchClosureView
        batch={completedBatch}
        recipeName="Ma blonde"
        volumeL={4.3}
        tasting={null}
        onRateTasting={onRateTasting}
      />,
    );

    fireEvent.press(screen.getByText("Noter ma dégustation"));
    expect(onRateTasting).toHaveBeenCalledTimes(1);
  });

  // Edge: a recorded tasting shows the note and HIDES the CTA (v1 = one tasting).
  it("shows the note and hides the CTA when a tasting is recorded", () => {
    render(
      <BatchClosureView
        batch={completedBatch}
        recipeName="Ma blonde"
        volumeL={4.3}
        tasting={recordedTasting}
        onRateTasting={onRateTasting}
      />,
    );

    expect(screen.getByTestId("closure-tasting-note")).toHaveTextContent(
      /Belle mousse/,
    );
    expect(screen.queryByText("Noter ma dégustation")).toBeNull();
  });

  // Sad path: no recipe name → title falls back to "Brassin <id.slice(0,8)>".
  it("falls back to a 'Brassin <id>' title when recipeName is null", () => {
    render(
      <BatchClosureView
        batch={completedBatch}
        recipeName={null}
        volumeL={4.3}
        tasting={null}
        onRateTasting={onRateTasting}
      />,
    );

    expect(
      screen.getByText(`Brassin ${completedBatch.id.slice(0, 8)}`),
    ).toBeTruthy();
  });

  // Edge: no bottledAt but a completedAt → the date line still renders.
  it("renders the date line from completedAt when bottledAt is absent", () => {
    render(
      <BatchClosureView
        batch={{ ...completedBatch, bottledAt: null }}
        recipeName="Ma blonde"
        volumeL={4.3}
        tasting={null}
        onRateTasting={onRateTasting}
      />,
    );

    expect(screen.getByText(/Mis en bouteille le/)).toBeTruthy();
  });

  // Edge: an invalid ISO date → no date line is rendered (no crash).
  it("renders no date line for an invalid ISO date", () => {
    render(
      <BatchClosureView
        batch={{
          ...completedBatch,
          bottledAt: "not-a-date",
          completedAt: null,
        }}
        recipeName="Ma blonde"
        volumeL={4.3}
        tasting={null}
        onRateTasting={onRateTasting}
      />,
    );

    expect(screen.queryByText(/Mis en bouteille le/)).toBeNull();
  });
});
