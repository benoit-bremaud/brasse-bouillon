import {
  completeCurrentStep as completeCurrentStepApi,
  deleteBatch as deleteBatchApi,
  getMineById,
  listMine,
  startBatch as startBatchApi,
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
  try {
    const recipe = await getRecipeDetails(batch.recipeId);
    recipeName = recipe?.name ?? null;
    recipeVolumeL = recipe?.stats?.volumeLiters ?? null;
  } catch {
    recipeName = null;
    recipeVolumeL = null;
  }
  return { batch, recipeName, recipeVolumeL };
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

export async function startBatch(recipeId: string): Promise<Batch> {
  if (dataSource.useDemoData) {
    const filRouge = demoBatches.find((item) => item.id === "b-demo-pdd-mash");
    if (!filRouge) {
      throw new Error(
        "Demo data is missing the fil-rouge batch b-demo-pdd-mash.",
      );
    }
    return filRouge;
  }

  return startBatchApi(recipeId);
}
