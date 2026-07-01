/**
 * BatchStatus
 *
 * Represents the lifecycle state of a brewing batch.
 */
export enum BatchStatus {
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
}

/**
 * Effective (derived) lifecycle state shown to clients. The DB keeps `status`
 * as the brewing lifecycle (in_progress/completed) plus nullable `cancelled_at`
 * / `archived_at` timestamps; the effective state is derived with archived
 * taking precedence over cancelled over the raw status (brew-day/07).
 */
export type EffectiveBatchStatus = BatchStatus | 'cancelled' | 'archived';

/**
 * Every value {@link EffectiveBatchStatus} can take, in precedence order. Kept
 * next to the type so the OpenAPI `enum` on BatchSummaryDto never drifts from it.
 */
export const EFFECTIVE_BATCH_STATUSES: EffectiveBatchStatus[] = [
  BatchStatus.IN_PROGRESS,
  BatchStatus.COMPLETED,
  'cancelled',
  'archived',
];

export function deriveEffectiveStatus(
  status: BatchStatus,
  cancelledAt: Date | null | undefined,
  archivedAt: Date | null | undefined,
): EffectiveBatchStatus {
  if (archivedAt) return 'archived';
  if (cancelledAt) return 'cancelled';
  return status;
}
