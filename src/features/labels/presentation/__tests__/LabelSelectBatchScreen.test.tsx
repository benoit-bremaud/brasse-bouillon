import {
  createLabelDraftFromBatch,
  listLabelBatchCandidates,
} from "@/features/labels/application/labels.use-cases";
import {
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react-native";

import { LabelDraft } from "@/features/labels/domain/label.types";
import { LabelSelectBatchScreen } from "@/features/labels/presentation/LabelSelectBatchScreen";
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

function buildDraft(overrides: Partial<LabelDraft> = {}): LabelDraft {
  return {
    id: "draft-1",
    batchId: "batch-1",
    bottleFormat: "33cl_long_neck",
    templateId: "template_1",
    editableFields: {
      name: "Saison",
      subtitle: "Ferme",
      paletteId: "sunset_amber",
      iconId: "hop",
    },
    autofillFields: {
      beerName: "Saison",
      style: "Ferme",
      abv: 6.2,
      volumeLiters: 0.33,
      breweryName: "Brasse Bouillon",
      brewDateIso: "2026-02-10T00:00:00.000Z",
    },
    previewSnapshot: {
      title: "Saison",
      subtitle: "Ferme",
      bottleFormatLabel: "33cl Long Neck",
      templateLabel: "Template Héritage",
      abvLabel: "ABV 6.2%",
      volumeLabel: "33 cl",
      breweryLabel: "Brasse Bouillon",
      brewDateLabel: "2026-02-10",
      legalHint:
        "L’abus d’alcool est dangereux pour la santé, à consommer avec modération.",
    },
    updatedAt: "2026-02-11T00:00:00.000Z",
    status: "draft",
    ...overrides,
  };
}

describe("LabelSelectBatchScreen", () => {
  beforeEach(() => {
    mockReplace.mockReset();
    mockedCreateLabelDraftFromBatch.mockReset();
    mockedListLabelBatchCandidates.mockReset();
  });

  it("creates a draft from the selected batch and routes to editor", async () => {
    mockedListLabelBatchCandidates.mockResolvedValue([
      {
        batchId: "batch-1",
        recipeId: "recipe-1",
        recipeName: "Saison",
        style: "Ferme",
        abv: 6.2,
        breweryName: "Brasse Bouillon",
        brewedAtIso: "2026-02-10T00:00:00.000Z",
        status: "completed",
      },
      {
        batchId: "batch-2",
        recipeId: "recipe-2",
        recipeName: "Hazy IPA",
        style: "Juicy",
        abv: 6.8,
        breweryName: "Brasse Bouillon",
        brewedAtIso: "2026-02-11T00:00:00.000Z",
        status: "in_progress",
      },
    ]);
    mockedCreateLabelDraftFromBatch.mockResolvedValue(
      buildDraft({ id: "draft-99", batchId: "batch-2" }),
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
});
