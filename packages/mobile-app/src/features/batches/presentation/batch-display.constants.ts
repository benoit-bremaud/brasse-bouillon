import type {
  BatchStatus,
  BatchStepStatus,
  BatchStepType,
} from "@/features/batches/domain/batch.types";

// French display labels for batch enums. The app has no centralized i18n
// layer yet, so — following the established per-feature constants pattern
// (see recipes/.../recipe-details.constants.ts) — enum-to-label mappings
// live next to the screen that renders them. Used by both the batch list
// (BatchesScreen) and the batch detail (BatchDetailsScreen).

export const BATCH_STATUS_LABELS: Record<BatchStatus, string> = {
  in_progress: "En cours",
  completed: "Terminé",
};

export const BATCH_STEP_STATUS_LABELS: Record<BatchStepStatus, string> = {
  pending: "À venir",
  in_progress: "En cours",
  completed: "Terminée",
};

export const BATCH_STEP_TYPE_LABELS: Record<BatchStepType, string> = {
  mash: "Empâtage",
  boil: "Ébullition",
  whirlpool: "Whirlpool",
  fermentation: "Fermentation",
  packaging: "Conditionnement",
};
