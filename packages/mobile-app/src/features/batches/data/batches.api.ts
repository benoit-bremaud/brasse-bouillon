import { request } from "@/core/http/http-client";

import { Batch, BatchStep, BatchSummary } from "../domain/batch.types";
import {
  PrimingInfo,
  PrimingSugarType,
  Tasting,
  TastingInput,
} from "../domain/bottling.types";
import {
  Measurement,
  MeasurementInput,
  MeasurementType,
} from "../domain/measurement.types";

type BatchSummaryDto = {
  id: string;
  owner_id: string;
  recipe_id: string;
  status: BatchSummary["status"];
  current_step_order?: number | null;
  started_at: string;
  fermentation_started_at?: string | null;
  fermentation_completed_at?: string | null;
  bottled_at?: string | null;
  completed_at?: string | null;
  created_at: string;
  updated_at: string;
};

type BatchStepDto = {
  batch_id: string;
  step_order: number;
  type: BatchStep["type"];
  label: string;
  description?: string | null;
  status: BatchStep["status"];
  started_at?: string | null;
  completed_at?: string | null;
  planned_duration_min?: number | null;
  pedagogical_tip?: string | null;
  created_at: string;
  updated_at: string;
};

type BatchDto = BatchSummaryDto & {
  steps: BatchStepDto[];
};

type StartBatchResponse = BatchDto;

/**
 * Raw measurement payload as returned by the backend (snake_case), mirroring
 * the existing `MeasurementDto`. Mapped to the {@link Measurement} domain
 * shape by {@link mapMeasurement}.
 */
type MeasurementDto = {
  id: string;
  batch_id: string;
  step_order?: number | null;
  type: MeasurementType;
  value: number;
  unit?: string | null;
  taken_at: string;
  created_at: string;
};

function mapBatchSummary(dto: BatchSummaryDto): BatchSummary {
  return {
    id: dto.id,
    ownerId: dto.owner_id,
    recipeId: dto.recipe_id,
    status: dto.status,
    currentStepOrder: dto.current_step_order ?? null,
    startedAt: dto.started_at,
    fermentationStartedAt: dto.fermentation_started_at ?? null,
    fermentationCompletedAt: dto.fermentation_completed_at ?? null,
    bottledAt: dto.bottled_at ?? null,
    completedAt: dto.completed_at ?? null,
    createdAt: dto.created_at,
    updatedAt: dto.updated_at,
  };
}

function mapBatchStep(dto: BatchStepDto): BatchStep {
  return {
    batchId: dto.batch_id,
    stepOrder: dto.step_order,
    type: dto.type,
    label: dto.label,
    description: dto.description ?? null,
    status: dto.status,
    startedAt: dto.started_at ?? null,
    completedAt: dto.completed_at ?? null,
    plannedDurationMin: dto.planned_duration_min ?? null,
    pedagogicalTip: dto.pedagogical_tip ?? null,
    createdAt: dto.created_at,
    updatedAt: dto.updated_at,
  };
}

function mapBatch(dto: BatchDto): Batch {
  return {
    ...mapBatchSummary(dto),
    steps: dto.steps.map(mapBatchStep),
  };
}

export async function listMine(): Promise<BatchSummary[]> {
  const rows = await request<BatchSummaryDto[]>("/batches");
  return rows.map(mapBatchSummary);
}

export async function getMineById(id: string): Promise<Batch> {
  const row = await request<BatchDto>(`/batches/${id}`);
  return mapBatch(row);
}

export async function startCurrentStep(id: string): Promise<Batch> {
  const row = await request<BatchDto>(`/batches/${id}/steps/current/start`, {
    method: "POST",
  });
  return mapBatch(row);
}

export async function completeCurrentStep(id: string): Promise<Batch> {
  const row = await request<BatchDto>(`/batches/${id}/steps/current/complete`, {
    method: "POST",
  });
  return mapBatch(row);
}

export async function startBatch(recipeId: string): Promise<Batch> {
  const row = await request<StartBatchResponse>("/batches", {
    method: "POST",
    body: { recipeId },
  });
  return mapBatch(row);
}

export async function deleteBatch(id: string): Promise<void> {
  await request<void>(`/batches/${id}`, { method: "DELETE" });
}

export async function cancelBatch(id: string): Promise<BatchSummary> {
  const row = await request<BatchSummaryDto>(`/batches/${id}/cancel`, {
    method: "PATCH",
  });
  return mapBatchSummary(row);
}

export async function archiveBatch(id: string): Promise<BatchSummary> {
  const row = await request<BatchSummaryDto>(`/batches/${id}/archive`, {
    method: "PATCH",
  });
  return mapBatchSummary(row);
}

/**
 * Raw priming payload as returned by the backend (snake_case), mirroring the
 * backend `PrimingDto`. Mapped to {@link PrimingInfo} by {@link mapPriming}.
 */
type PrimingDto = {
  sugar_grams: number;
  sugar_type: PrimingSugarType;
  target_co2_vol: number;
  volume_l: number;
  safety_warning: string;
};

/**
 * Raw tasting payload as returned by the backend (snake_case), mirroring the
 * backend `TastingDto`. Mapped to {@link Tasting} by {@link mapTasting}.
 */
type TastingDto = {
  id: string;
  batch_id: string;
  rating: number;
  note?: string | null;
  created_at: string;
};

/**
 * Maps a raw {@link PrimingDto} to the {@link PrimingInfo} domain shape.
 *
 * @param dto - Raw priming payload from the backend.
 * @returns The priming guidance in camelCase domain form.
 */
function mapPriming(dto: PrimingDto): PrimingInfo {
  return {
    sugarGrams: dto.sugar_grams,
    sugarType: dto.sugar_type,
    targetCo2Vol: dto.target_co2_vol,
    volumeL: dto.volume_l,
    safetyWarning: dto.safety_warning,
  };
}

/**
 * Maps a raw {@link TastingDto} to the {@link Tasting} domain shape,
 * nullish-coalescing the optional note to `null` (same convention as
 * {@link mapMeasurement}).
 *
 * @param dto - Raw tasting payload from the backend.
 * @returns The tasting in camelCase domain form.
 */
function mapTasting(dto: TastingDto): Tasting {
  return {
    id: dto.id,
    batchId: dto.batch_id,
    rating: dto.rating,
    note: dto.note ?? null,
    createdAt: dto.created_at,
  };
}

/**
 * Reads the priming sugar guidance for a batch via
 * `GET /batches/:id/priming`. Volume comes from the recipe (ADR-0020).
 *
 * @param batchId - Identifier of the batch to compute priming for.
 * @returns The priming guidance in domain form.
 */
export async function getPriming(batchId: string): Promise<PrimingInfo> {
  const row = await request<PrimingDto>(`/batches/${batchId}/priming`);
  return mapPriming(row);
}

/**
 * Closes the batch (bottling) via `POST /batches/:id/bottling/close`. Sets
 * `bottled_at` and completes the current step through the workflow engine; the
 * batch reaches `completed` when it was on its final (packaging) step.
 *
 * @param batchId - Identifier of the batch to close.
 * @returns The updated batch (including `bottledAt`) in domain form.
 */
export async function closeBottling(batchId: string): Promise<Batch> {
  const row = await request<BatchDto>(`/batches/${batchId}/bottling/close`, {
    method: "POST",
  });
  return mapBatch(row);
}

/**
 * Records a tasting against a batch via `POST /batches/:id/tasting`
 * (one tasting per batch in v1).
 *
 * @param batchId - Identifier of the batch to attach the tasting to.
 * @param input - Tasting creation payload (rating 1..5, optional note).
 * @returns The persisted tasting in domain form.
 */
export async function createTasting(
  batchId: string,
  input: TastingInput,
): Promise<Tasting> {
  const row = await request<TastingDto>(`/batches/${batchId}/tasting`, {
    method: "POST",
    body: input,
  });
  return mapTasting(row);
}

/**
 * Reads the tasting recorded for a batch via `GET /batches/:id/tasting`.
 * The backend returns 404 ("Tasting not found") when none exists yet.
 *
 * @param batchId - Identifier of the batch to read the tasting for.
 * @returns The recorded tasting in domain form.
 */
export async function getTasting(batchId: string): Promise<Tasting> {
  const row = await request<TastingDto>(`/batches/${batchId}/tasting`);
  return mapTasting(row);
}

/**
 * Maps a raw {@link MeasurementDto} to the {@link Measurement} domain shape,
 * nullish-coalescing the optional fields to `null` (same convention as
 * {@link mapBatchStep}).
 *
 * @param dto - Raw measurement payload from the backend.
 * @returns The measurement in camelCase domain form.
 */
function mapMeasurement(dto: MeasurementDto): Measurement {
  return {
    id: dto.id,
    batchId: dto.batch_id,
    stepOrder: dto.step_order ?? null,
    type: dto.type,
    value: dto.value,
    unit: dto.unit ?? null,
    takenAt: dto.taken_at,
    createdAt: dto.created_at,
  };
}

/**
 * Records a measurement against a batch via the existing
 * `POST /batches/:id/measurements` endpoint.
 *
 * @param batchId - Identifier of the batch to attach the reading to.
 * @param input - Measurement creation payload (type, value, optional takenAt).
 * @returns The persisted measurement in domain form.
 */
export async function createMeasurement(
  batchId: string,
  input: MeasurementInput,
): Promise<Measurement> {
  const row = await request<MeasurementDto>(
    `/batches/${batchId}/measurements`,
    {
      method: "POST",
      body: input,
    },
  );
  return mapMeasurement(row);
}

/**
 * Lists the measurements recorded against a batch via the existing
 * `GET /batches/:id/measurements` endpoint.
 *
 * @param batchId - Identifier of the batch to read measurements for.
 * @returns The batch's measurements in domain form.
 */
export async function listMeasurements(
  batchId: string,
): Promise<Measurement[]> {
  const rows = await request<MeasurementDto[]>(
    `/batches/${batchId}/measurements`,
  );
  return rows.map(mapMeasurement);
}
