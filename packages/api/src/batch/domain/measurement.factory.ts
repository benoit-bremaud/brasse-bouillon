import {
  GRAVITY_MEASUREMENT_TYPES,
  MeasurementType,
} from './enums/measurement-type.enum';

/** Raw input for a new measurement, before validation/normalisation. */
export interface MeasurementInput {
  batchId: string;
  type: MeasurementType;
  value: number;
  stepOrder?: number | null;
  unit?: string | null;
  takenAt?: Date;
}

/** A validated, normalised measurement (the shape the service persists). */
export interface Measurement {
  batchId: string;
  type: MeasurementType;
  value: number;
  stepOrder: number | null;
  unit: string | null;
  takenAt: Date;
}

/** Raised when a measurement violates a domain invariant (#605). */
export class MeasurementValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'MeasurementValidationError';
  }
}

// Plausible physical ranges — reject obvious garbage (typos, wrong unit) early.
const GRAVITY_MIN = 0.99;
const GRAVITY_MAX = 1.2;
const TEMPERATURE_MIN_C = -10;
const TEMPERATURE_MAX_C = 120;
const PH_MIN = 0;
const PH_MAX = 14;

function rangeFor(type: MeasurementType): { min: number; max: number } {
  if (GRAVITY_MEASUREMENT_TYPES.includes(type)) {
    return { min: GRAVITY_MIN, max: GRAVITY_MAX };
  }
  if (type === MeasurementType.TEMPERATURE) {
    return { min: TEMPERATURE_MIN_C, max: TEMPERATURE_MAX_C };
  }
  return { min: PH_MIN, max: PH_MAX }; // pH
}

/**
 * Validate + normalise a measurement against its domain invariants (#605):
 * non-empty batch, finite value within the plausible range for its type, and a
 * non-negative integer step order when provided. Returns the normalised value
 * object or throws `MeasurementValidationError`.
 */
export function createMeasurement(input: MeasurementInput): Measurement {
  if (!input.batchId || input.batchId.trim().length === 0) {
    throw new MeasurementValidationError('batchId is required');
  }
  if (!Object.values(MeasurementType).includes(input.type)) {
    throw new MeasurementValidationError(
      `unknown measurement type: ${input.type}`,
    );
  }
  if (!Number.isFinite(input.value)) {
    throw new MeasurementValidationError('value must be a finite number');
  }

  const { min, max } = rangeFor(input.type);
  if (input.value < min || input.value > max) {
    throw new MeasurementValidationError(
      `${input.type} value ${input.value} is out of range [${min}, ${max}]`,
    );
  }

  if (
    input.stepOrder != null &&
    (!Number.isInteger(input.stepOrder) || input.stepOrder < 0)
  ) {
    throw new MeasurementValidationError(
      'stepOrder must be a non-negative integer',
    );
  }

  return {
    batchId: input.batchId,
    type: input.type,
    value: input.value,
    stepOrder: input.stepOrder ?? null,
    unit: input.unit ?? null,
    takenAt: input.takenAt ?? new Date(),
  };
}
