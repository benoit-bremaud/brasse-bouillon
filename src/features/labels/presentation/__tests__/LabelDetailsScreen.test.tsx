import {
  getLabelDraftById,
  removeLabelDraft,
} from "@/features/labels/application/labels.use-cases";
import {
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react-native";

import { LabelDraft } from "@/features/labels/domain/label.types";
import { LabelDetailsScreen } from "@/features/labels/presentation/LabelDetailsScreen";
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
  removeLabelDraft: jest.fn(),
}));

const mockedGetLabelDraftById = getLabelDraftById as jest.MockedFunction<
  typeof getLabelDraftById
>;
const mockedRemoveLabelDraft = removeLabelDraft as jest.MockedFunction<
  typeof removeLabelDraft
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

describe("LabelDetailsScreen", () => {
  beforeEach(() => {
    mockPush.mockReset();
    mockReplace.mockReset();
    mockedGetLabelDraftById.mockReset();
    mockedRemoveLabelDraft.mockReset();
  });

  it("renders draft details and opens editor", async () => {
    mockedGetLabelDraftById.mockResolvedValue(buildDraft());

    render(<LabelDetailsScreen draftIdParam="draft-1" />);

    expect(await screen.findByText("Détails du brouillon")).toBeTruthy();
    expect(screen.getByText("Saison")).toBeTruthy();
    expect(screen.getByText("Informations")).toBeTruthy();

    fireEvent.press(screen.getByLabelText("Modifier le brouillon"));

    expect(mockPush).toHaveBeenCalledWith({
      pathname: "/(app)/dashboard/labels/create/editor",
      params: { draftId: "draft-1" },
    });
  });

  it("deletes draft and routes to labels home", async () => {
    mockedGetLabelDraftById.mockResolvedValue(buildDraft());
    mockedRemoveLabelDraft.mockResolvedValue(undefined);

    render(<LabelDetailsScreen draftIdParam="draft-1" />);

    expect(await screen.findByText("Saison")).toBeTruthy();

    fireEvent.press(screen.getByLabelText("Supprimer le brouillon"));

    await waitFor(() => {
      expect(mockedRemoveLabelDraft).toHaveBeenCalledWith("draft-1");
    });

    expect(mockReplace).toHaveBeenCalledWith("/(app)/dashboard/labels");
  });
});
