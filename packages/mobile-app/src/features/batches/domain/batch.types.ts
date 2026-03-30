export type BatchStatus = "in_progress" | "completed";

export type BatchStepStatus = "pending" | "in_progress" | "completed";

export type BatchStepType =
  | "mash"
  | "boil"
  | "whirlpool"
  | "fermentation"
  | "packaging";

export type BatchSummary = {
  id: string;
  ownerId: string;
  recipeId: string;
  status: BatchStatus;
  currentStepOrder?: number | null;
  startedAt: string;
  fermentationStartedAt?: string | null;
  fermentationCompletedAt?: string | null;
  completedAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type BatchStep = {
  batchId: string;
  stepOrder: number;
  type: BatchStepType;
  label: string;
  description?: string | null;
  status: BatchStepStatus;
  startedAt?: string | null;
  completedAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Batch = BatchSummary & {
  steps: BatchStep[];
};
