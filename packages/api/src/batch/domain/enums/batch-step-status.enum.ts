/**
 * BatchStepStatus
 *
 * Tracks progress of a step inside a running batch.
 */
export enum BatchStepStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
}
