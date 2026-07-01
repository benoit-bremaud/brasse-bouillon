// Effective lifecycle status returned by the API: the brewing status
// (in_progress | completed) unless the batch was cancelled or archived
// (soft states derived server-side, archived > cancelled — brew-day/07).
export type BatchStatus =
  | "in_progress"
  | "completed"
  | "cancelled"
  | "archived";

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
  // ISO-8601 instant the batch was bottled (B3 closure), or null before
  // bottling. The status stays "completed" — there is no BOTTLED status
  // (ADR/state-05); bottledAt is the dedicated timestamp.
  bottledAt?: string | null;
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
  // Planned active duration for the step's countdown timer (brewing assistant,
  // #781). Optional: long phases (fermentation) use the day-based tracker, and
  // legacy steps may omit it.
  plannedDurationMin?: number | null;
  // Vulgarized "why" surfaced via the ⓘ icon on the step (brewing assistant).
  pedagogicalTip?: string | null;
};

export type Batch = BatchSummary & {
  steps: BatchStep[];
};
