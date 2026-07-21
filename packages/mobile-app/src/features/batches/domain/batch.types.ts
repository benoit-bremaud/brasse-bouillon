// Effective lifecycle status returned by the API: the brewing status
// (in_progress | completed) unless the batch is a never-launched draft
// (« en préparation », F14/F15) or was cancelled or archived (soft states
// derived server-side, archived > cancelled > draft — brew-day/07).
export type BatchStatus =
  | "draft"
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
  // ISO-8601 launch instant, or null while the batch is an « en préparation »
  // draft (the brew has not started — brew-day/07).
  startedAt: string | null;
  fermentationStartedAt?: string | null;
  fermentationCompletedAt?: string | null;
  // ISO-8601 instant the batch was bottled (B3 closure), or null before
  // bottling. The status stays "completed" — there is no BOTTLED status
  // (ADR/state-05); bottledAt is the dedicated timestamp.
  bottledAt?: string | null;
  completedAt?: string | null;
  // Current step's real schedule (from the launch snapshot), so the dashboard
  // shows a true deadline instead of a hardcoded projection. `currentStepDueAt`
  // is null when the step has not started / has no planned duration; the label
  // is null and `currentStepIsCritical` false when there is no current step
  // (draft / completed batch). Optional so older fixtures/demo rows omit them;
  // the API mapping always populates them.
  currentStepLabel?: string | null;
  currentStepDueAt?: string | null;
  currentStepIsCritical?: boolean;
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
  // PRÉP-phase physical gestures, each with its pedagogical why (F4,
  // brew-day/01+06). Null on legacy steps and types without prep (packaging).
  prepActions?: StepPrepAction[] | null;
  // ACTIF-phase end condition (F5): when the step is over, one pedagogical
  // sentence. Never gates Complete. Null on legacy steps.
  doneWhen?: string | null;
};

// One PRÉP gesture + its one-line why — the app teaches, a novice must learn
// to brew alone (educational vocation).
export type StepPrepAction = {
  action: string;
  why: string;
};

export type Batch = BatchSummary & {
  steps: BatchStep[];
  // Checked prep-item ids carried by an « en préparation » draft (F14 — the
  // coches live on the batch, per-brew). Null when nothing was ever checked;
  // the checklist items themselves stay derived from the recipe.
  prepCheckedIds?: string[] | null;
};
