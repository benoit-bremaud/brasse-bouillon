import {
  getLabelDraftById,
  updateLabelDraft,
} from "@/features/labels/application/labels.use-cases";
import {
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react-native";

import { LabelDraft } from "@/features/labels/domain/label.types";
import { LabelEditorScreen } from "@/features/labels/presentation/LabelEditorScreen";
import React from "react";

const mockPush = jest.fn();
const mockReplace = jest.fn();

jest.mock("@expo/vector-icons", () => ({
  Ionicons: () => null,
}));

jest.mock("expo-router", () => {
  const actual = jest.requireActual("expo-router");

  return {
    ...actual,
    useRouter: () => ({
      push: mockPush,
      replace: mockReplace,
      back: jest.fn(),
    }),
  };
});

jest.mock("@/features/labels/application/labels.use-cases", () => ({
  getLabelDraftById: jest.fn(),
  updateLabelDraft: jest.fn(),
}));

const mockedGetLabelDraftById = getLabelDraftById as jest.MockedFunction<
  typeof getLabelDraftById
>;
const mockedUpdateLabelDraft = updateLabelDraft as jest.MockedFunction<
  typeof updateLabelDraft
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

describe("LabelEditorScreen", () => {
  beforeEach(() => {
    mockPush.mockReset();
    mockReplace.mockReset();
    mockedGetLabelDraftById.mockReset();
    mockedUpdateLabelDraft.mockReset();
  });

  it("loads, updates and opens details view", async () => {
    const initialDraft = buildDraft();
    const updatedDraft = buildDraft({
      editableFields: {
        ...initialDraft.editableFields,
        name: "Saison révisée",
        subtitle: "Batch spécial",
      },
    });

    mockedGetLabelDraftById.mockResolvedValue(initialDraft);
    mockedUpdateLabelDraft.mockResolvedValue(updatedDraft);

    render(<LabelEditorScreen draftIdParam="draft-1" />);

    expect(await screen.findByDisplayValue("Saison")).toBeTruthy();

    fireEvent.changeText(
      screen.getByLabelText("Modifier le nom de l’étiquette"),
      "Saison révisée",
    );
    fireEvent.changeText(
      screen.getByLabelText("Modifier le sous-titre de l’étiquette"),
      "Batch spécial",
    );

    fireEvent.press(screen.getByLabelText("Enregistrer le brouillon"));

    await waitFor(() => {
      expect(mockedUpdateLabelDraft).toHaveBeenCalledWith(
        expect.objectContaining({
          draftId: "draft-1",
          customName: "Saison révisée",
          customSubtitle: "Batch spécial",
        }),
      );
    });

    expect(await screen.findByText("Brouillon enregistré.")).toBeTruthy();

    fireEvent.press(screen.getByLabelText("Ouvrir la fiche du brouillon"));
    expect(mockPush).toHaveBeenCalledWith("/(app)/dashboard/labels/draft-1");
  });

  it("routes back to labels home from header action", async () => {
    mockedGetLabelDraftById.mockResolvedValue(buildDraft());

    render(<LabelEditorScreen draftIdParam="draft-1" />);

    expect(await screen.findByDisplayValue("Saison")).toBeTruthy();

    fireEvent.press(screen.getByLabelText("Retour à mes étiquettes"));

    expect(mockReplace).toHaveBeenCalledWith("/(app)/dashboard/labels");
  });
});
