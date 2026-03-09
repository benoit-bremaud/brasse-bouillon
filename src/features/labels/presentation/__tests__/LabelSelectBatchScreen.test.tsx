import {
  createLabelDraftFromBatch,
  listLabelBatchCandidates,
} from "@/features/labels/application/labels.use-cases";
import {
  LabelSelectBatchScreen,
  resolveSelectedBatchId,
} from "@/features/labels/presentation/LabelSelectBatchScreen";
import {
  buildLabelBatchCandidate,
  buildLabelDraft,
} from "@/features/labels/test-utils/label-test-fixtures";
import {
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react-native";

import React from "react";

const mockReplace = jest.fn();

jest.mock("@expo/vector-icons", () => ({
  Ionicons: () => null,
}));

jest.mock("expo-router", () => {
  const actual = jest.requireActual("expo-router");

  return {
    ...actual,
    useRouter: () => ({
      push: jest.fn(),
      replace: mockReplace,
      back: jest.fn(),
    }),
  };
});

jest.mock("@/features/labels/application/labels.use-cases", () => ({
  createLabelDraftFromBatch: jest.fn(),
  listLabelBatchCandidates: jest.fn(),
}));

const mockedCreateLabelDraftFromBatch =
  createLabelDraftFromBatch as jest.MockedFunction<
    typeof createLabelDraftFromBatch
  >;
const mockedListLabelBatchCandidates =
  listLabelBatchCandidates as jest.MockedFunction<
    typeof listLabelBatchCandidates
  >;

describe("LabelSelectBatchScreen", () => {
  beforeEach(() => {
    mockReplace.mockReset();
    mockedCreateLabelDraftFromBatch.mockReset();
    mockedListLabelBatchCandidates.mockReset();
  });

  it("creates a draft from the selected batch and routes to editor", async () => {
    mockedListLabelBatchCandidates.mockResolvedValue([
      buildLabelBatchCandidate(),
      buildLabelBatchCandidate({
        batchId: "batch-2",
        recipeId: "recipe-2",
        recipeName: "Hazy IPA",
        style: "Juicy",
        abv: 6.8,
        brewedAtIso: "2026-02-11T00:00:00.000Z",
        status: "in_progress",
      }),
    ]);
    mockedCreateLabelDraftFromBatch.mockResolvedValue(
      buildLabelDraft({ id: "draft-99", batchId: "batch-2" }),
    );

    render(<LabelSelectBatchScreen />);

    expect(await screen.findByText("Saison")).toBeTruthy();
    expect(screen.getByText("Hazy IPA")).toBeTruthy();

    fireEvent.press(screen.getByLabelText("Sélectionner le brassin Hazy IPA"));
    fireEvent.press(screen.getByLabelText("Créer un brouillon d’étiquette"));

    await waitFor(() => {
      expect(mockedCreateLabelDraftFromBatch).toHaveBeenCalledWith({
        batchId: "batch-2",
        bottleFormat: "33cl_long_neck",
        templateId: "template_1",
      });
    });
    expect(mockReplace).toHaveBeenCalledWith({
      pathname: "/(app)/dashboard/labels/create/editor",
      params: { draftId: "draft-99" },
    });
  });

  it("navigates back to labels home from header action", async () => {
    mockedListLabelBatchCandidates.mockResolvedValue([]);

    render(<LabelSelectBatchScreen />);

    expect(await screen.findByText("Aucun brassin disponible")).toBeTruthy();

    fireEvent.press(screen.getByLabelText("Retour à mes étiquettes"));

    expect(mockReplace).toHaveBeenCalledWith("/(app)/dashboard/labels");
  });

  it("keeps current selection only when it still exists", () => {
    const candidates = [
      buildLabelBatchCandidate(),
      buildLabelBatchCandidate({ batchId: "batch-2", recipeName: "Hazy IPA" }),
    ];

    expect(resolveSelectedBatchId("batch-2", candidates)).toBe("batch-2");
    expect(resolveSelectedBatchId("unknown", candidates)).toBe("batch-1");
    expect(resolveSelectedBatchId("batch-2", [])).toBeNull();
  });
});
