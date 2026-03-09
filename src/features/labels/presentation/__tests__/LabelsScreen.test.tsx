import {
  listLabelDrafts,
  removeLabelDraft,
} from "@/features/labels/application/labels.use-cases";
import {
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react-native";

import { LabelsScreen } from "@/features/labels/presentation/LabelsScreen";
import React from "react";

const mockPush = jest.fn();

jest.mock("expo-router", () => {
  const actual = jest.requireActual("expo-router");

  return {
    ...actual,
    useRouter: () => ({
      push: mockPush,
      replace: jest.fn(),
      back: jest.fn(),
    }),
  };
});

jest.mock("@/features/labels/application/labels.use-cases", () => ({
  listLabelDrafts: jest.fn(),
  removeLabelDraft: jest.fn(),
}));

const mockedListLabelDrafts = listLabelDrafts as jest.MockedFunction<
  typeof listLabelDrafts
>;
const mockedRemoveLabelDraft = removeLabelDraft as jest.MockedFunction<
  typeof removeLabelDraft
>;

describe("LabelsScreen", () => {
  beforeEach(() => {
    mockPush.mockReset();
    mockedListLabelDrafts.mockReset();
    mockedRemoveLabelDraft.mockReset();
  });

  it("shows empty state and navigates to select-batch flow", async () => {
    mockedListLabelDrafts.mockResolvedValue([]);

    render(<LabelsScreen />);

    expect(
      await screen.findByText("Aucune étiquette enregistrée"),
    ).toBeTruthy();
    expect(screen.getByText("Exemples d’inspiration")).toBeTruthy();

    fireEvent.press(screen.getByLabelText("Créer une étiquette"));

    expect(mockPush).toHaveBeenCalledWith(
      "/(app)/dashboard/labels/create/select-batch",
    );
  });

  it("renders 5 inspirations and updates preview on model selection", async () => {
    mockedListLabelDrafts.mockResolvedValue([]);

    render(<LabelsScreen />);

    expect(
      await screen.findByText("Aucune étiquette enregistrée"),
    ).toBeTruthy();

    expect(screen.getAllByLabelText(/Sélectionner le modèle/)).toHaveLength(5);
    expect(screen.getByText("Modèle sélectionné : Hoppy Dawn")).toBeTruthy();
    expect(screen.getByText("Palette : Sunset Amber")).toBeTruthy();
    expect(screen.getByText("ABV 5.2%")).toBeTruthy();

    fireEvent.press(
      screen.getByLabelText("Sélectionner le modèle Velvet Night"),
    );

    expect(screen.getByText("Modèle sélectionné : Velvet Night")).toBeTruthy();
    expect(screen.getByText("Palette : Midnight Stout")).toBeTruthy();
    expect(screen.getByText("ABV 8.5%")).toBeTruthy();
  });

  it("opens and deletes a draft from list", async () => {
    mockedListLabelDrafts
      .mockResolvedValueOnce([
        {
          id: "draft-1",
          batchId: "batch-1",
          bottleFormat: "33cl_long_neck",
          templateId: "template_1",
          editableFields: {
            name: "Hoppy Dawn",
            subtitle: "Session IPA",
            paletteId: "sunset_amber",
            iconId: "hop",
          },
          autofillFields: {
            beerName: "Hoppy Dawn",
            style: "Session IPA",
            abv: 5.2,
            volumeLiters: 0.33,
            breweryName: "Brasse Bouillon",
            brewDateIso: "2026-01-10T00:00:00.000Z",
          },
          previewSnapshot: {
            title: "Hoppy Dawn",
            subtitle: "Session IPA",
            bottleFormatLabel: "33cl Long Neck",
            templateLabel: "Template Héritage",
            abvLabel: "ABV 5.2%",
            volumeLabel: "33 cl",
            breweryLabel: "Brasse Bouillon",
            brewDateLabel: "2026-01-10",
            legalHint:
              "L’abus d’alcool est dangereux pour la santé, à consommer avec modération.",
          },
          updatedAt: "2026-01-10T00:00:00.000Z",
          status: "draft",
        },
      ])
      .mockResolvedValueOnce([]);
    mockedRemoveLabelDraft.mockResolvedValue(undefined);

    render(<LabelsScreen />);

    expect(await screen.findByText("Hoppy Dawn")).toBeTruthy();

    fireEvent.press(screen.getByLabelText("Ouvrir Hoppy Dawn"));

    expect(mockPush).toHaveBeenCalledWith("/(app)/dashboard/labels/draft-1");

    fireEvent.press(screen.getByLabelText("Supprimer Hoppy Dawn"));

    await waitFor(() => {
      expect(mockedRemoveLabelDraft).toHaveBeenCalledWith("draft-1");
    });
    await waitFor(() => {
      expect(screen.getByText("Aucune étiquette enregistrée")).toBeTruthy();
    });
  });
});
