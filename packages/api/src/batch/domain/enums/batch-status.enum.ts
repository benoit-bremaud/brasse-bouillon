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
 * as the brewing lifecycle (in_progress/completed) plus nullable timestamps;
 * the effective state is derived with archived taking precedence over
 * cancelled, then draft (`launched_at` still null — prepared but never
 * launched, brew-day/07 F14/F15), then the raw status.
 */
export type EffectiveBatchStatus =
  | BatchStatus
  | 'draft'
  | 'cancelled'
  | 'archived';

/**
 * Every value {@link EffectiveBatchStatus} can take, in lifecycle order. Kept
 * next to the type so the OpenAPI `enum` on BatchSummaryDto never drifts from it.
 */
export const EFFECTIVE_BATCH_STATUSES: EffectiveBatchStatus[] = [
  'draft',
  BatchStatus.IN_PROGRESS,
  BatchStatus.COMPLETED,
  'cancelled',
  'archived',
];

export function deriveEffectiveStatus(
  status: BatchStatus,
  cancelledAt: Date | null | undefined,
  archivedAt: Date | null | undefined,
  launchedAt: Date | null | undefined,
): EffectiveBatchStatus {
  if (archivedAt) return 'archived';
  if (cancelledAt) return 'cancelled';
  if (!launchedAt) return 'draft';
  return status;
}
