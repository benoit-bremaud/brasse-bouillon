/**
 * Application use-cases for fermentation gravity measurements (B2 — US-0404).
 *
 * Branches on {@link dataSource.useDemoData} exactly like
 * `completeCurrentBatchStep`: demo mode uses a local in-memory mock (mirroring
 * the existing demo tracker) so the soutenance demo runs offline; live mode
 * delegates to the data layer (`batches.api` over the shared http-client).
 *
 * No UI imports — this layer sits between presentation and data.
 */

import { dataSource } from "@/core/data/data-source";
import {
  createMeasurement,
  listMeasurements,
} from "@/features/batches/data/batches.api";
import {
  Measurement,
  MeasurementInput,
} from "@/features/batches/domain/measurement.types";

/**
 * In-memory demo store keyed by batch id. Mirrors the demo fermentation
 * tracker: readings recorded during a demo session persist for the lifetime
 * of the JS runtime so the UI reflects them without a backend.
 */
const demoMeasurements = new Map<string, Measurement[]>();

/**
 * Clears the in-memory demo measurement store. Test-support only: lets a suite
 * isolate the demo path between runs, since the store is module-level state.
 */
export function clearDemoMeasurements(): void {
  demoMeasurements.clear();
}

/**
 * Builds a demo {@link Measurement} from a creation input, filling the
 * server-assigned fields locally so the demo behaves like the live API.
 */
function buildDemoMeasurement(
  batchId: string,
  input: MeasurementInput,
): Measurement {
  const now = new Date().toISOString();
  return {
    id: `demo-measurement-${batchId}-${input.type}-${now}`,
    batchId,
    stepOrder: null,
    type: input.type,
    value: input.value,
    unit: null,
    takenAt: input.takenAt ?? now,
    createdAt: now,
  };
}

/**
 * Records a measurement against a batch.
 *
 * @param batchId - Identifier of the batch to attach the reading to.
 * @param input - Measurement creation payload (type, value, optional takenAt).
 * @returns The persisted measurement, or `null` when `batchId` is empty.
 */
export async function recordBatchMeasurement(
  batchId: string,
  input: MeasurementInput,
): Promise<Measurement | null> {
  if (!batchId) {
    return null;
  }
  if (dataSource.useDemoData) {
    const measurement = buildDemoMeasurement(batchId, input);
    const existing = demoMeasurements.get(batchId) ?? [];
    demoMeasurements.set(batchId, [...existing, measurement]);
    return measurement;
  }
  return createMeasurement(batchId, input);
}

/**
 * Lists the measurements recorded against a batch.
 *
 * @param batchId - Identifier of the batch to read measurements for.
 * @returns The batch's measurements (empty array when `batchId` is empty).
 */
export async function listBatchMeasurements(
  batchId: string,
): Promise<Measurement[]> {
  if (!batchId) {
    return [];
  }
  if (dataSource.useDemoData) {
    return demoMeasurements.get(batchId) ?? [];
  }
  return listMeasurements(batchId);
}
