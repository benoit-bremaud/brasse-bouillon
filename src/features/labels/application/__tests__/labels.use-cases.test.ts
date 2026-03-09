import {
  createLabelDraftFromBatch,
  listLabelBatchCandidates,
  listLabelDrafts,
  purgeLabelDrafts,
  removeLabelDraft,
  updateLabelDraft,
} from "@/features/labels/application/labels.use-cases";

import { listBatches } from "@/features/batches/application/batches.use-cases";
import { labelsStorage } from "@/features/labels/data/labels.repository";
import { buildLabelDraft } from "@/features/labels/test-utils/label-test-fixtures";
import { listRecipes } from "@/features/recipes/application/recipes.use-cases";

jest.mock("@/features/batches/application/batches.use-cases", () => ({
  listBatches: jest.fn(),
}));

jest.mock("@/features/recipes/application/recipes.use-cases", () => ({
  listRecipes: jest.fn(),
}));

jest.mock("@/features/labels/data/labels.repository", () => ({
  labelsStorage: {
    listDrafts: jest.fn(),
    getDraftById: jest.fn(),
    saveDraft: jest.fn(),
    removeDraft: jest.fn(),
    purgeAll: jest.fn(),
  },
}));

const mockedListBatches = listBatches as jest.MockedFunction<
  typeof listBatches
>;
const mockedListRecipes = listRecipes as jest.MockedFunction<
  typeof listRecipes
>;
const mockedLabelsStorage = labelsStorage as jest.Mocked<typeof labelsStorage>;

describe("labels use-cases", () => {
  beforeEach(() => {
    mockedListBatches.mockReset();
    mockedListRecipes.mockReset();
    mockedLabelsStorage.listDrafts.mockReset();
    mockedLabelsStorage.getDraftById.mockReset();
    mockedLabelsStorage.saveDraft.mockReset();
    mockedLabelsStorage.removeDraft.mockReset();
    mockedLabelsStorage.purgeAll.mockReset();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("maps and sorts batch candidates from newest to oldest", async () => {
    mockedListBatches.mockResolvedValue([
      {
        id: "batch-old",
        ownerId: "u1",
        recipeId: "recipe-old",
        status: "completed",
        startedAt: "2026-01-10T00:00:00.000Z",
        createdAt: "2026-01-10T00:00:00.000Z",
        updatedAt: "2026-01-10T00:00:00.000Z",
      },
      {
        id: "batch-new",
        ownerId: "u1",
        recipeId: "recipe-new",
        status: "in_progress",
        startedAt: "2026-02-10T00:00:00.000Z",
        createdAt: "2026-02-10T00:00:00.000Z",
        updatedAt: "2026-02-10T00:00:00.000Z",
      },
    ]);

    mockedListRecipes.mockResolvedValue([
      {
        id: "recipe-old",
        ownerId: "u1",
        name: "Amber Ale",
        description: "Maltée",
        stats: {
          ibu: 25,
          abv: 5,
          og: 1.05,
          fg: 1.012,
          volumeLiters: 20,
        },
        ingredients: [],
        equipment: [],
        visibility: "private",
        version: 1,
        rootRecipeId: "recipe-old",
        parentRecipeId: null,
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
      },
      {
        id: "recipe-new",
        ownerId: "u1",
        name: "Hazy IPA",
        description: null,
        stats: {
          ibu: 40,
          abv: 6.5,
          og: 1.06,
          fg: 1.014,
          volumeLiters: 20,
        },
        ingredients: [],
        equipment: [],
        visibility: "private",
        version: 1,
        rootRecipeId: "recipe-new",
        parentRecipeId: null,
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
      },
    ]);

    const candidates = await listLabelBatchCandidates();

    expect(candidates).toHaveLength(2);
    expect(candidates[0].batchId).toBe("batch-new");
    expect(candidates[0].style).toBe("Hazy IPA");
    expect(candidates[1].batchId).toBe("batch-old");
    expect(candidates[1].style).toBe("Maltée");
  });

  it("sorts drafts by updated date descending", async () => {
    mockedLabelsStorage.listDrafts.mockResolvedValue([
      buildLabelDraft({ id: "draft-1", updatedAt: "2026-01-01T00:00:00.000Z" }),
      buildLabelDraft({
        id: "draft-2",
        updatedAt: "2026-02-01T00:00:00.000Z",
      }),
    ]);

    const drafts = await listLabelDrafts();

    expect(drafts.map((draft) => draft.id)).toEqual(["draft-2", "draft-1"]);
  });

  it("creates and persists a draft from a selected batch", async () => {
    jest.spyOn(Date, "now").mockReturnValue(1700000000000);

    mockedListBatches.mockResolvedValue([
      {
        id: "batch-1",
        ownerId: "u1",
        recipeId: "recipe-1",
        status: "completed",
        startedAt: "2026-02-10T00:00:00.000Z",
        createdAt: "2026-02-10T00:00:00.000Z",
        updatedAt: "2026-02-10T00:00:00.000Z",
      },
    ]);
    mockedListRecipes.mockResolvedValue([
      {
        id: "recipe-1",
        ownerId: "u1",
        name: "Saison",
        description: "Ferme",
        stats: {
          ibu: 30,
          abv: 6.2,
          og: 1.054,
          fg: 1.01,
          volumeLiters: 20,
        },
        ingredients: [],
        equipment: [],
        visibility: "private",
        version: 1,
        rootRecipeId: "recipe-1",
        parentRecipeId: null,
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
      },
    ]);
    mockedLabelsStorage.saveDraft.mockResolvedValue(undefined);

    const draft = await createLabelDraftFromBatch({
      batchId: "batch-1",
      bottleFormat: "75cl_champenoise",
      templateId: "template_2",
    });

    expect(draft.id).toBe("label-1700000000000");
    expect(draft.previewSnapshot.title).toBe("Saison");
    expect(draft.previewSnapshot.volumeLabel).toBe("75 cl");
    expect(mockedLabelsStorage.saveDraft).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "label-1700000000000",
        batchId: "batch-1",
        bottleFormat: "75cl_champenoise",
      }),
    );
  });

  it("returns null when updating an unknown draft", async () => {
    mockedLabelsStorage.getDraftById.mockResolvedValue(null);

    const updatedDraft = await updateLabelDraft({
      draftId: "unknown",
      customName: "Nouveau nom",
    });

    expect(updatedDraft).toBeNull();
    expect(mockedLabelsStorage.saveDraft).not.toHaveBeenCalled();
  });

  it("updates and persists an existing draft", async () => {
    mockedLabelsStorage.getDraftById.mockResolvedValue(
      buildLabelDraft({
        id: "draft-1",
        bottleFormat: "33cl_long_neck",
        templateId: "template_1",
      }),
    );
    mockedLabelsStorage.saveDraft.mockResolvedValue(undefined);

    const updatedDraft = await updateLabelDraft({
      draftId: "draft-1",
      bottleFormat: "75cl_champenoise",
      templateId: "template_2",
      paletteId: "midnight_stout",
      iconId: "barley",
      customName: "Nouveau nom",
      customSubtitle: "Nouvelle série",
    });

    expect(updatedDraft).toBeTruthy();
    expect(updatedDraft?.editableFields.name).toBe("Nouveau nom");
    expect(updatedDraft?.editableFields.subtitle).toBe("Nouvelle série");
    expect(updatedDraft?.editableFields.paletteId).toBe("midnight_stout");
    expect(updatedDraft?.editableFields.iconId).toBe("barley");
    expect(updatedDraft?.previewSnapshot.templateLabel).toBe(
      "Template Moderne",
    );
    expect(updatedDraft?.previewSnapshot.volumeLabel).toBe("75 cl");
    expect(mockedLabelsStorage.saveDraft).toHaveBeenCalledTimes(1);
  });

  it("removes and purges drafts from storage", async () => {
    mockedLabelsStorage.removeDraft.mockResolvedValue(undefined);
    mockedLabelsStorage.purgeAll.mockResolvedValue(undefined);

    await removeLabelDraft("  draft-42  ");
    await purgeLabelDrafts();

    expect(mockedLabelsStorage.removeDraft).toHaveBeenCalledWith("draft-42");
    expect(mockedLabelsStorage.purgeAll).toHaveBeenCalledTimes(1);
  });
});
