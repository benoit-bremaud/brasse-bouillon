/**
 * Application use-cases for the B3 bottling / priming / tasting flow.
 *
 * Branches on {@link dataSource.useDemoData} exactly like the measurement
 * use-cases: demo mode uses local mocks (so the soutenance demo runs offline);
 * live mode delegates to the data layer (`batches.api` over the shared
 * http-client). No UI imports — this layer sits between presentation and data.
 */

import { dataSource } from "@/core/data/data-source";
import { HttpError } from "@/core/http/http-error";
import {
  closeBottling as closeBottlingApi,
  createTasting as createTastingApi,
  getPriming as getPrimingApi,
  getTasting as getTastingApi,
} from "@/features/batches/data/batches.api";
import { Batch } from "@/features/batches/domain/batch.types";
import {
  PrimingInfo,
  SAFETY_WARNING,
  Tasting,
  TastingInput,
} from "@/features/batches/domain/bottling.types";
import { demoBatches } from "@/mocks/demo-data";

// Simple-mode priming defaults used by the demo path. These must track the
// backend DEFAULT_G_PER_L / DEFAULT_TARGET_CO2_VOL (priming-calculator.ts) so
// the offline demo and the live simple dose agree — change them together.
const DEMO_PRIMING_G_PER_L = 6.5; // backend DEFAULT_G_PER_L
const DEMO_TARGET_CO2_VOL = 2.4; // backend DEFAULT_TARGET_CO2_VOL
const DEMO_VOLUME_L = 4.3;

/**
 * In-memory demo tasting store keyed by batch id. Mirrors the demo measurement
 * tracker: a tasting recorded during a demo session persists for the lifetime
 * of the JS runtime so the UI reflects it without a backend.
 */
const demoTastings = new Map<string, Tasting>();

/**
 * Clears the in-memory demo tasting store. Test-support only: lets a suite
 * isolate the demo path between runs, since the store is module-level state.
 */
export function clearDemoTastings(): void {
  demoTastings.clear();
}

/** Rounds a number to one decimal place (matches the backend rounding). */
function roundOneDp(value: number): number {
  return Math.round(value * 10) / 10;
}

/**
 * Reads the priming sugar guidance for a batch.
 *
 * @param batchId - Identifier of the batch to compute priming for.
 * @returns The priming guidance, or `null` when `batchId` is empty.
 */
export async function getBottlingInfo(
  batchId: string,
): Promise<PrimingInfo | null> {
  if (!batchId) {
    return null;
  }
  if (dataSource.useDemoData) {
    return {
      sugarGrams: roundOneDp(DEMO_VOLUME_L * DEMO_PRIMING_G_PER_L),
      sugarType: "table_sugar",
      targetCo2Vol: DEMO_TARGET_CO2_VOL,
      volumeL: DEMO_VOLUME_L,
      safetyWarning: SAFETY_WARNING,
    };
  }
  return getPrimingApi(batchId);
}

/**
 * Closes the batch (bottling): records `bottledAt` and completes the current
 * step. In demo mode it returns the matching demo batch unchanged (the demo
 * closure view is driven separately).
 *
 * @param batchId - Identifier of the batch to close.
 * @returns The updated batch, or `null` when `batchId` is empty.
 */
export async function closeBottling(batchId: string): Promise<Batch | null> {
  if (!batchId) {
    return null;
  }
  if (dataSource.useDemoData) {
    return demoBatches.find((item) => item.id === batchId) ?? null;
  }
  return closeBottlingApi(batchId);
}

/**
 * Records a tasting against a batch.
 *
 * @param batchId - Identifier of the batch to attach the tasting to.
 * @param input - Tasting creation payload (rating 1..5, optional note).
 * @returns The persisted tasting, or `null` when `batchId` is empty.
 */
export async function recordTasting(
  batchId: string,
  input: TastingInput,
): Promise<Tasting | null> {
  if (!batchId) {
    return null;
  }
  if (dataSource.useDemoData) {
    const note = input.note?.trim() ? input.note.trim() : null;
    const tasting: Tasting = {
      id: `demo-tasting-${batchId}`,
      batchId,
      rating: input.rating,
      note,
      createdAt: new Date().toISOString(),
    };
    demoTastings.set(batchId, tasting);
    return tasting;
  }
  return createTastingApi(batchId, input);
}

/**
 * Reads the tasting recorded for a batch, or `null` when none exists yet.
 *
 * Unlike the live data layer (which 404s when there is no tasting), this
 * use-case maps the not-found case to `null` so the closure view can render
 * "pas encore noté" without an error branch. Any OTHER failure (e.g. a 500 or a
 * network error) is re-thrown so the screen surfaces it instead of masking a
 * broken read as "not noted yet".
 *
 * @param batchId - Identifier of the batch to read the tasting for.
 * @returns The recorded tasting, or `null` when none exists / `batchId` empty.
 */
export async function getTasting(batchId: string): Promise<Tasting | null> {
  if (!batchId) {
    return null;
  }
  if (dataSource.useDemoData) {
    return demoTastings.get(batchId) ?? null;
  }
  try {
    return await getTastingApi(batchId);
  } catch (error) {
    // 404 ("Tasting not found") is the expected "not noted yet" state, not an
    // error the closure view should surface. Anything else is a real failure.
    if (error instanceof HttpError && error.status === 404) {
      return null;
    }
    throw error;
  }
}
