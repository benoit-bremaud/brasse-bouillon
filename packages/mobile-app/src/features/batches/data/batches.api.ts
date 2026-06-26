import { request } from "@/core/http/http-client";

import { Batch, BatchStep, BatchSummary } from "../domain/batch.types";
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
