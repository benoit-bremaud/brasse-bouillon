import { request } from "@/core/http/http-client";

import { Batch, BatchStep, BatchSummary } from "../domain/batch.types";

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
  created_at: string;
  updated_at: string;
};

type BatchDto = BatchSummaryDto & {
  steps: BatchStepDto[];
};

type StartBatchResponse = BatchDto;

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
