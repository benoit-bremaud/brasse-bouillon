import {
  archiveBatch as archiveBatchApi,
  cancelBatch as cancelBatchApi,
  completeCurrentStep as completeCurrentStepApi,
  deleteBatch as deleteBatchApi,
  getMineById,
  launchBatch as launchBatchApi,
  listMine,
  prepareBatch as prepareBatchApi,
  startBatch as startBatchApi,
  startCurrentStep as startCurrentStepApi,
  updatePrepChecklist as updatePrepChecklistApi,
} from "@/features/batches/data/batches.api";
import { Batch, BatchSummary } from "@/features/batches/domain/batch.types";
import { demoBatchSummaries, demoBatches } from "@/mocks/demo-data";

import { dataSource } from "@/core/data/data-source";
import { getRecipeDetails } from "@/features/recipes/application/recipes.use-cases";

export async function listBatches(): Promise<BatchSummary[]> {
  return dataSource.useDemoData ? demoBatchSummaries : listMine();
}

/**
 * Delete one of the current user's batches. In demo mode this is a no-op — the
 * bundled demo batches are read-only.
 */
export async function deleteBatch(batchId: string): Promise<void> {
  if (dataSource.useDemoData) {
    return;
  }
  await deleteBatchApi(batchId);
}

/**
 * Cancel a launched brew (F16) — soft, keeps the journal (distinct from
 * deleteBatch). No-op in demo mode (demo batches are read-only).
 */
export async function cancelBatch(batchId: string): Promise<void> {
  if (!batchId || dataSource.useDemoData) {
    return;
  }
  await cancelBatchApi(batchId);
}

/**
 * Archive a finished or cancelled brew (F25) — soft-hides it from the active
 * list. No-op in demo mode.
 */
export async function archiveBatch(batchId: string): Promise<void> {
  if (!batchId || dataSource.useDemoData) {
    return;
  }
  await archiveBatchApi(batchId);
}

export async function getBatchDetails(batchId: string): Promise<Batch | null> {
  if (!batchId) {
    return null;
  }
  if (dataSource.useDemoData) {
    return demoBatches.find((item) => item.id === batchId) ?? null;
  }
  return getMineById(batchId);
}

// View-model that enriches a batch with its recipe name for display.
// The Batch domain object only carries `recipeId` (true for both the demo
// store and the backend `BatchDto`), but the detail screen needs the recipe
// name as its title. `getRecipeDetails` already branches on the demo/backend
// toggle, so resolving the name here works in both modes.
export interface BatchDetailsViewModel {
  batch: Batch;
  recipeName: string | null;
  // Recipe batch volume in litres, surfaced for the B3 closure view. Best-effort
  // like `recipeName`: null when the recipe lookup fails or omits the stat.
  recipeVolumeL?: number | null;
  // Recipe target gravities, surfaced for the JIT-density estimate fallback (F3):
  // a novice who cannot measure sees a display-only ABV computed from these.
  // Best-effort like the others — null when the recipe lookup fails or omits them.
  recipeOg?: number | null;
  recipeFg?: number | null;
}

// A real beer gravity sits roughly in [0.98, 1.2]. The recipe-stats mapper fills
// a missing target with 0 (sentinel); treat any out-of-range value as absent so
// the density estimate never computes a nonsensical ABV from it (brew-day/08).
function plausibleGravity(value: number | null | undefined): number | null {
  return value != null && value > 0.9 && value < 1.25 ? value : null;
}

export async function getBatchDetailsViewModel(
  batchId: string,
): Promise<BatchDetailsViewModel | null> {
  const batch = await getBatchDetails(batchId);
  if (!batch) {
    return null;
  }
  // The recipe name is a best-effort title enrichment, not core batch data.
  // A failed/forbidden/missing recipe lookup (e.g. a 404 or transient API
  // error in backend mode) must not break the batch details screen — fall
  // back to the "Brassin <id>" title instead of rejecting the whole query.
  let recipeName: string | null = null;
  let recipeVolumeL: number | null = null;
  let recipeOg: number | null = null;
  let recipeFg: number | null = null;
  try {
    const recipe = await getRecipeDetails(batch.recipeId);
    recipeName = recipe?.name ?? null;
    recipeVolumeL = recipe?.stats?.volumeLiters ?? null;
    recipeOg = plausibleGravity(recipe?.stats?.og);
    recipeFg = plausibleGravity(recipe?.stats?.fg);
  } catch {
    recipeName = null;
    recipeVolumeL = null;
    recipeOg = null;
    recipeFg = null;
  }
  return { batch, recipeName, recipeVolumeL, recipeOg, recipeFg };
}

export async function startCurrentBatchStep(
  batchId: string,
): Promise<Batch | null> {
  if (!batchId) {
    return null;
  }
  if (dataSource.useDemoData) {
    return demoBatches.find((item) => item.id === batchId) ?? null;
  }
  return startCurrentStepApi(batchId);
}

export async function completeCurrentBatchStep(
  batchId: string,
): Promise<Batch | null> {
  if (!batchId) {
    return null;
  }
  if (dataSource.useDemoData) {
    return demoBatches.find((item) => item.id === batchId) ?? null;
  }
  return completeCurrentStepApi(batchId);
}

// Demo mode maps every batch start/launch onto the bundled fil-rouge batch —
// the demo store is read-only, so no real batch is ever created.
function getDemoFilRougeBatch(): Batch {
  const filRouge = demoBatches.find((item) => item.id === "b-demo-pdd-mash");
  if (!filRouge) {
    throw new Error(
      "Demo data is missing the fil-rouge batch b-demo-pdd-mash.",
    );
  }
  return filRouge;
}

export async function startBatch(recipeId: string): Promise<Batch> {
  if (dataSource.useDemoData) {
    return getDemoFilRougeBatch();
  }

  return startBatchApi(recipeId);
}

/**
 * Create (or resume) the « en préparation » draft batch carrying the prep
 * checklist for a recipe (brew-day/07, F14/F15). In demo mode the draft is a
 * synthetic, non-persisted object — the demo store stays read-only, ticks
 * live in screen state only.
 */
export async function prepareBatch(recipeId: string): Promise<Batch> {
  if (dataSource.useDemoData) {
    const now = new Date().toISOString();
    return {
      id: `demo-draft-${recipeId}`,
      ownerId: "demo-user",
      recipeId,
      status: "draft",
      currentStepOrder: null,
      startedAt: null,
      steps: [],
      prepCheckedIds: [],
      createdAt: now,
      updatedAt: now,
    };
  }

  return prepareBatchApi(recipeId);
}

/**
 * Persist the draft's checked prep-item ids (F14 — coches live on the batch,
 * per-brew). No-op in demo mode (the synthetic draft is not persisted).
 */
export async function updateBatchPrepChecklist(
  batchId: string,
  checkedIds: string[],
): Promise<void> {
  if (!batchId || dataSource.useDemoData) {
    return;
  }
  await updatePrepChecklistApi(batchId, checkedIds);
}

/**
 * Launch a draft — the draft → in_progress transition of brew-day/07 (the
 * recipe steps are snapshotted server-side at launch). Demo mode returns the
 * fil-rouge batch, mirroring `startBatch`.
 */
export async function launchBatch(batchId: string): Promise<Batch> {
  if (dataSource.useDemoData) {
    return getDemoFilRougeBatch();
  }

  return launchBatchApi(batchId);
}
