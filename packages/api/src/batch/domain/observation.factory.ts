/** Raw input for a new observation, before validation/normalisation. */
export interface ObservationInput {
  batchId: string;
  freeText: string;
  stepOrder?: number | null;
  photoRefs?: string[] | null;
  moodScore?: number | null;
  observedAt?: Date;
}

/** A validated, normalised observation (the shape the service persists). */
export interface Observation {
  batchId: string;
  freeText: string;
  stepOrder: number | null;
  photoRefs: string[];
  moodScore: number | null;
  observedAt: Date;
}

/** Raised when an observation violates a domain invariant (#605). */
export class ObservationValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ObservationValidationError';
  }
}

export const MOOD_SCORE_MIN = 1;
export const MOOD_SCORE_MAX = 5;
const FREE_TEXT_MAX = 2000;

/**
 * Validate + normalise an observation against its domain invariants (#605):
 * non-empty batch, non-empty free text within a sane length, a non-negative
 * integer step order, an optional 1–5 integer mood score, and string photo
 * refs. Returns the normalised value object or throws.
 */
export function createObservation(input: ObservationInput): Observation {
  if (!input.batchId || input.batchId.trim().length === 0) {
    throw new ObservationValidationError('batchId is required');
  }

  const freeText = input.freeText?.trim() ?? '';
  if (freeText.length === 0) {
    throw new ObservationValidationError('freeText is required');
  }
  if (freeText.length > FREE_TEXT_MAX) {
    throw new ObservationValidationError(
      `freeText exceeds ${FREE_TEXT_MAX} characters`,
    );
  }

  if (
    input.stepOrder != null &&
    (!Number.isInteger(input.stepOrder) || input.stepOrder < 0)
  ) {
    throw new ObservationValidationError(
      'stepOrder must be a non-negative integer',
    );
  }

  if (
    input.moodScore != null &&
    (!Number.isInteger(input.moodScore) ||
      input.moodScore < MOOD_SCORE_MIN ||
      input.moodScore > MOOD_SCORE_MAX)
  ) {
    throw new ObservationValidationError(
      `moodScore must be an integer in [${MOOD_SCORE_MIN}, ${MOOD_SCORE_MAX}]`,
    );
  }

  const photoRefs = input.photoRefs ?? [];
  if (photoRefs.some((ref) => typeof ref !== 'string' || ref.trim() === '')) {
    throw new ObservationValidationError('photoRefs must be non-empty strings');
  }

  return {
    batchId: input.batchId,
    freeText,
    stepOrder: input.stepOrder ?? null,
    photoRefs,
    moodScore: input.moodScore ?? null,
    observedAt: input.observedAt ?? new Date(),
  };
}
