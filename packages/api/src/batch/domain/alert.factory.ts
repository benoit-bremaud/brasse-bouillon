import { AlertSeverity } from './enums/alert-severity.enum';
import { AlertTrigger } from './enums/alert-trigger.enum';

/** Raw input for a new alert, before validation/normalisation. */
export interface AlertInput {
  batchId: string;
  trigger: AlertTrigger;
  severity: AlertSeverity;
  stepOrder?: number | null;
  message?: string | null;
  triggeredAt?: Date;
  dismissedAt?: Date | null;
}

/** A validated, normalised alert (the shape the service persists). */
export interface Alert {
  batchId: string;
  trigger: AlertTrigger;
  severity: AlertSeverity;
  stepOrder: number | null;
  message: string | null;
  triggeredAt: Date;
  dismissedAt: Date | null;
}

/** Raised when an alert violates a domain invariant (#605). */
export class AlertValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AlertValidationError';
  }
}

/**
 * Validate + normalise an alert against its domain invariants (#605):
 * non-empty batch, known trigger + severity, non-negative integer step order,
 * and a dismissal that cannot predate the trigger. Returns the normalised
 * value object or throws.
 */
export function createAlert(input: AlertInput): Alert {
  if (!input.batchId || input.batchId.trim().length === 0) {
    throw new AlertValidationError('batchId is required');
  }
  if (!Object.values(AlertTrigger).includes(input.trigger)) {
    throw new AlertValidationError(`unknown trigger: ${input.trigger}`);
  }
  if (!Object.values(AlertSeverity).includes(input.severity)) {
    throw new AlertValidationError(`unknown severity: ${input.severity}`);
  }
  if (
    input.stepOrder != null &&
    (!Number.isInteger(input.stepOrder) || input.stepOrder < 0)
  ) {
    throw new AlertValidationError('stepOrder must be a non-negative integer');
  }

  const triggeredAt = input.triggeredAt ?? new Date();
  const dismissedAt = input.dismissedAt ?? null;
  if (dismissedAt != null && dismissedAt.getTime() < triggeredAt.getTime()) {
    throw new AlertValidationError('dismissedAt cannot predate triggeredAt');
  }

  const message = input.message?.trim() ?? '';

  return {
    batchId: input.batchId,
    trigger: input.trigger,
    severity: input.severity,
    stepOrder: input.stepOrder ?? null,
    message: message.length > 0 ? message : null,
    triggeredAt,
    dismissedAt,
  };
}
