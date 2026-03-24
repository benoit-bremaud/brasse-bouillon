import { listBatches } from "@/features/batches/application/batches.use-cases";
import { labelsStorage } from "@/features/labels/data/labels.repository";
import {
  DEFAULT_LABEL_ICON_ID,
  DEFAULT_LABEL_PALETTE_ID,
  LABEL_BOTTLE_FORMAT_LABELS,
  LABEL_BOTTLE_FORMAT_VOLUME_LITERS,
  LABEL_TEMPLATE_LABELS,
  LabelBatchCandidate,
  LabelBottleFormat,
  LabelDraft,
  LabelEditableFields,
  LabelIconId,
  LabelPaletteId,
  LabelTemplateId,
} from "@/features/labels/domain/label.types";
import { listRecipes } from "@/features/recipes/application/recipes.use-cases";

const DEFAULT_BREWERY_NAME = "Brasse Bouillon";
const DEFAULT_LABEL_LEGAL_HINT =
  "L’abus d’alcool est dangereux pour la santé, à consommer avec modération.";

export interface CreateLabelDraftInput {
  batchId: string;
  bottleFormat: LabelBottleFormat;
  templateId: LabelTemplateId;
  paletteId?: LabelPaletteId;
  iconId?: LabelIconId;
  customName?: string;
  customSubtitle?: string;
}

export interface UpdateLabelDraftInput {
  draftId: string;
  bottleFormat?: LabelBottleFormat;
  templateId?: LabelTemplateId;
  paletteId?: LabelPaletteId;
  iconId?: LabelIconId;
  customName?: string;
  customSubtitle?: string;
}

function normalizeText(value?: string | null): string {
  return value?.trim() ?? "";
}

function buildLabelDraftId(): string {
  return `label-${Date.now()}`;
}

function toDateLabel(isoDate: string): string {
  const parsedDate = Date.parse(isoDate);
  if (Number.isNaN(parsedDate)) {
    return "Date inconnue";
  }

  return new Date(parsedDate).toISOString().slice(0, 10);
}

function toAbvLabel(abv: number | null): string {
  if (abv === null) {
    return "ABV non renseigné";
  }

  return `ABV ${abv.toFixed(1)}%`;
}

function toVolumeLabel(volumeLiters: number): string {
  const centiliters = Math.round(volumeLiters * 100);
  return `${centiliters} cl`;
}

function resolvePreviewTitle(input: {
  editableFields: LabelEditableFields;
  fallbackBeerName: string;
}): string {
  const customName = normalizeText(input.editableFields.name);
  if (customName) {
    return customName;
  }

  return normalizeText(input.fallbackBeerName) || "Bière sans nom";
}

function resolvePreviewSubtitle(input: {
  editableFields: LabelEditableFields;
  fallbackStyle: string;
}): string {
  const customSubtitle = normalizeText(input.editableFields.subtitle);
  if (customSubtitle) {
    return customSubtitle;
  }

  return normalizeText(input.fallbackStyle) || "Style non précisé";
}

function buildPreviewSnapshot(input: {
  bottleFormat: LabelBottleFormat;
  templateId: LabelTemplateId;
  editableFields: LabelEditableFields;
  beerName: string;
  style: string;
  abv: number | null;
  volumeLiters: number;
  breweryName: string;
  brewDateIso: string;
}): LabelDraft["previewSnapshot"] {
  return {
    title: resolvePreviewTitle({
      editableFields: input.editableFields,
      fallbackBeerName: input.beerName,
    }),
    subtitle: resolvePreviewSubtitle({
      editableFields: input.editableFields,
      fallbackStyle: input.style,
    }),
    bottleFormatLabel: LABEL_BOTTLE_FORMAT_LABELS[input.bottleFormat],
    templateLabel: LABEL_TEMPLATE_LABELS[input.templateId],
    abvLabel: toAbvLabel(input.abv),
    volumeLabel: toVolumeLabel(input.volumeLiters),
    breweryLabel: normalizeText(input.breweryName) || DEFAULT_BREWERY_NAME,
    brewDateLabel: toDateLabel(input.brewDateIso),
    legalHint: DEFAULT_LABEL_LEGAL_HINT,
  };
}

function resolveCandidateStyle(
  recipeName: string,
  recipeDescription?: string | null,
): string {
  const normalizedDescription = normalizeText(recipeDescription);
  if (normalizedDescription) {
    return normalizedDescription;
  }

  return normalizeText(recipeName) || "Style non précisé";
}

function resolveCandidateBreweryName(): string {
  return DEFAULT_BREWERY_NAME;
}

function resolveUpdatedText(currentValue: string, nextValue?: string): string {
  if (nextValue === undefined) {
    return currentValue;
  }

  return normalizeText(nextValue);
}

export async function listLabelBatchCandidates(): Promise<
  LabelBatchCandidate[]
> {
  const [batches, recipes] = await Promise.all([listBatches(), listRecipes()]);
  const recipesById = new Map(recipes.map((recipe) => [recipe.id, recipe]));

  return [...batches]
    .map((batch) => {
      const recipe = recipesById.get(batch.recipeId);
      const recipeName =
        recipe?.name ?? `Recette ${batch.recipeId.slice(0, 6)}`;

      return {
        batchId: batch.id,
        recipeId: batch.recipeId,
        recipeName,
        style: resolveCandidateStyle(recipeName, recipe?.description),
        abv: recipe?.stats?.abv ?? null,
        breweryName: resolveCandidateBreweryName(),
        brewedAtIso: batch.startedAt,
        status: batch.status,
      } satisfies LabelBatchCandidate;
    })
    .sort((candidateA, candidateB) =>
      candidateB.brewedAtIso.localeCompare(candidateA.brewedAtIso),
    );
}

export async function listLabelDrafts(): Promise<LabelDraft[]> {
  const drafts = await labelsStorage.listDrafts();

  return [...drafts].sort((draftA, draftB) =>
    draftB.updatedAt.localeCompare(draftA.updatedAt),
  );
}

export async function getLabelDraftById(
  draftId: string,
): Promise<LabelDraft | null> {
  const normalizedDraftId = normalizeText(draftId);
  if (!normalizedDraftId) {
    return null;
  }

  return labelsStorage.getDraftById(normalizedDraftId);
}

export async function createLabelDraftFromBatch(
  input: CreateLabelDraftInput,
): Promise<LabelDraft> {
  const normalizedBatchId = normalizeText(input.batchId);
  if (!normalizedBatchId) {
    throw new Error("Batch id is required to create a label draft.");
  }

  const candidates = await listLabelBatchCandidates();
  const candidate = candidates.find(
    (item) => item.batchId === normalizedBatchId,
  );
  if (!candidate) {
    throw new Error("Selected batch is unavailable for label creation.");
  }

  const nowIso = new Date().toISOString();
  const volumeLiters = LABEL_BOTTLE_FORMAT_VOLUME_LITERS[input.bottleFormat];
  const editableFields: LabelEditableFields = {
    name: normalizeText(input.customName) || candidate.recipeName,
    subtitle: normalizeText(input.customSubtitle) || candidate.style,
    paletteId: input.paletteId ?? DEFAULT_LABEL_PALETTE_ID,
    iconId: input.iconId ?? DEFAULT_LABEL_ICON_ID,
  };

  const draft: LabelDraft = {
    id: buildLabelDraftId(),
    batchId: candidate.batchId,
    bottleFormat: input.bottleFormat,
    templateId: input.templateId,
    editableFields,
    autofillFields: {
      beerName: candidate.recipeName,
      style: candidate.style,
      abv: candidate.abv,
      volumeLiters,
      breweryName: candidate.breweryName,
      brewDateIso: candidate.brewedAtIso,
    },
    previewSnapshot: buildPreviewSnapshot({
      bottleFormat: input.bottleFormat,
      templateId: input.templateId,
      editableFields,
      beerName: candidate.recipeName,
      style: candidate.style,
      abv: candidate.abv,
      volumeLiters,
      breweryName: candidate.breweryName,
      brewDateIso: candidate.brewedAtIso,
    }),
    updatedAt: nowIso,
    status: "draft",
  };

  await labelsStorage.saveDraft(draft);

  return draft;
}

export async function updateLabelDraft(
  input: UpdateLabelDraftInput,
): Promise<LabelDraft | null> {
  const existingDraft = await getLabelDraftById(input.draftId);
  if (!existingDraft) {
    return null;
  }

  const bottleFormat = input.bottleFormat ?? existingDraft.bottleFormat;
  const templateId = input.templateId ?? existingDraft.templateId;
  const volumeLiters = LABEL_BOTTLE_FORMAT_VOLUME_LITERS[bottleFormat];
  const editableFields: LabelEditableFields = {
    name: resolveUpdatedText(
      existingDraft.editableFields.name,
      input.customName,
    ),
    subtitle: resolveUpdatedText(
      existingDraft.editableFields.subtitle,
      input.customSubtitle,
    ),
    paletteId: input.paletteId ?? existingDraft.editableFields.paletteId,
    iconId: input.iconId ?? existingDraft.editableFields.iconId,
  };

  const nextDraft: LabelDraft = {
    ...existingDraft,
    bottleFormat,
    templateId,
    editableFields,
    autofillFields: {
      ...existingDraft.autofillFields,
      volumeLiters,
    },
    previewSnapshot: buildPreviewSnapshot({
      bottleFormat,
      templateId,
      editableFields,
      beerName: existingDraft.autofillFields.beerName,
      style: existingDraft.autofillFields.style,
      abv: existingDraft.autofillFields.abv,
      volumeLiters,
      breweryName: existingDraft.autofillFields.breweryName,
      brewDateIso: existingDraft.autofillFields.brewDateIso,
    }),
    updatedAt: new Date().toISOString(),
  };

  await labelsStorage.saveDraft(nextDraft);

  return nextDraft;
}

export async function removeLabelDraft(draftId: string): Promise<void> {
  const normalizedDraftId = normalizeText(draftId);
  if (!normalizedDraftId) {
    return;
  }

  await labelsStorage.removeDraft(normalizedDraftId);
}

export async function purgeLabelDrafts(): Promise<void> {
  await labelsStorage.purgeAll();
}
