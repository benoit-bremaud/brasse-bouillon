import {
  completeCurrentStep as completeCurrentStepApi,
  getMineById,
  listMine,
  startBatch as startBatchApi,
} from "@/features/batches/data/batches.api";
import { Batch, BatchSummary } from "@/features/batches/domain/batch.types";
import { demoBatchSummaries, demoBatches } from "@/mocks/demo-data";

import { dataSource } from "@/core/data/data-source";

export async function listBatches(): Promise<BatchSummary[]> {
  return dataSource.useDemoData ? demoBatchSummaries : listMine();
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
    throw new Error(
      "Starting a batch is disabled when using demo data. Switch to live data to start a batch.",
    );
  }

  return startBatchApi(recipeId);
}
