import {
  LabelBatchCandidate,
  LabelDraft,
} from "@/features/labels/domain/label.types";

const DEFAULT_LABEL_LEGAL_HINT =
  "L’abus d’alcool est dangereux pour la santé, à consommer avec modération.";

type LabelDraftOverrides = Partial<
  Omit<LabelDraft, "editableFields" | "autofillFields" | "previewSnapshot">
> & {
  editableFields?: Partial<LabelDraft["editableFields"]>;
  autofillFields?: Partial<LabelDraft["autofillFields"]>;
  previewSnapshot?: Partial<LabelDraft["previewSnapshot"]>;
};

export function buildLabelDraft(
  overrides: LabelDraftOverrides = {},
): LabelDraft {
  const baseDraft: LabelDraft = {
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
      legalHint: DEFAULT_LABEL_LEGAL_HINT,
    },
    updatedAt: "2026-02-11T00:00:00.000Z",
    status: "draft",
  };

  return {
    ...baseDraft,
    ...overrides,
    editableFields: {
      ...baseDraft.editableFields,
      ...overrides.editableFields,
    },
    autofillFields: {
      ...baseDraft.autofillFields,
      ...overrides.autofillFields,
    },
    previewSnapshot: {
      ...baseDraft.previewSnapshot,
      ...overrides.previewSnapshot,
    },
  };
}

export function buildLabelBatchCandidate(
  overrides: Partial<LabelBatchCandidate> = {},
): LabelBatchCandidate {
  return {
    batchId: "batch-1",
    recipeId: "recipe-1",
    recipeName: "Saison",
    style: "Ferme",
    abv: 6.2,
    breweryName: "Brasse Bouillon",
    brewedAtIso: "2026-02-10T00:00:00.000Z",
    status: "completed",
    ...overrides,
  };
}
