export type LabelDraftStatus = "draft";

export type LabelBottleFormat =
  | "33cl_long_neck"
  | "75cl_champenoise"
  | "44cl_can";

export type LabelTemplateId = "template_1" | "template_2" | "template_3";

export type LabelPaletteId = "sunset_amber" | "hop_garden" | "midnight_stout";

export type LabelIconId = "hop" | "flask" | "barley";

export const LABEL_BOTTLE_FORMAT_LABELS: Record<LabelBottleFormat, string> = {
  "33cl_long_neck": "33cl Long Neck",
  "75cl_champenoise": "75cl Champenoise",
  "44cl_can": "44cl Canette",
};

export const LABEL_TEMPLATE_LABELS: Record<LabelTemplateId, string> = {
  template_1: "Template Héritage",
  template_2: "Template Moderne",
  template_3: "Template Brut",
};

export const LABEL_BOTTLE_FORMAT_VOLUME_LITERS: Record<
  LabelBottleFormat,
  number
> = {
  "33cl_long_neck": 0.33,
  "75cl_champenoise": 0.75,
  "44cl_can": 0.44,
};

export const DEFAULT_LABEL_TEMPLATE_ID: LabelTemplateId = "template_1";
export const DEFAULT_LABEL_PALETTE_ID: LabelPaletteId = "sunset_amber";
export const DEFAULT_LABEL_ICON_ID: LabelIconId = "hop";

export interface LabelAutofillFields {
  beerName: string;
  style: string;
  abv: number | null;
  volumeLiters: number;
  breweryName: string;
  brewDateIso: string;
}

export interface LabelEditableFields {
  name: string;
  subtitle: string;
  paletteId: LabelPaletteId;
  iconId: LabelIconId;
}

export interface LabelPreviewSnapshot {
  title: string;
  subtitle: string;
  bottleFormatLabel: string;
  templateLabel: string;
  abvLabel: string;
  volumeLabel: string;
  breweryLabel: string;
  brewDateLabel: string;
  legalHint: string;
}

export interface LabelDraft {
  id: string;
  batchId: string;
  bottleFormat: LabelBottleFormat;
  templateId: LabelTemplateId;
  editableFields: LabelEditableFields;
  autofillFields: LabelAutofillFields;
  previewSnapshot: LabelPreviewSnapshot;
  updatedAt: string;
  status: LabelDraftStatus;
}

export interface LabelBatchCandidate {
  batchId: string;
  recipeId: string;
  recipeName: string;
  style: string;
  abv: number | null;
  breweryName: string;
  brewedAtIso: string;
  status: "in_progress" | "completed";
}

export interface LabelDraftStorageRepository {
  listDrafts(): Promise<LabelDraft[]>;
  getDraftById(draftId: string): Promise<LabelDraft | null>;
  saveDraft(draft: LabelDraft): Promise<void>;
  removeDraft(draftId: string): Promise<void>;
  purgeAll(): Promise<void>;
}
