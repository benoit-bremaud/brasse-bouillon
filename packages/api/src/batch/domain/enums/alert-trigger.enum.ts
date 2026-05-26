/**
 * What raised an alert on a batch (#605, slice 3).
 *
 * - `overdue` — a step's planned end passed without completion.
 * - `threshold` — a measurement crossed a configured bound (temp/pH/gravity).
 */
export enum AlertTrigger {
  OVERDUE = 'overdue',
  THRESHOLD = 'threshold',
}
