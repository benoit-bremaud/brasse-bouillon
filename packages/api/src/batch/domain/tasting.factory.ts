/** Raw input for a new tasting, before validation/normalisation. */
export interface TastingInput {
  batchId: string;
  rating: number;
  note?: string | null;
}

/** A validated, normalised tasting (the shape the service persists). */
export interface Tasting {
  batchId: string;
  rating: number;
  note: string | null;
}

/** Raised when a tasting violates a domain invariant (B3). */
export class TastingValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TastingValidationError';
  }
}

const RATING_MIN = 1;
const RATING_MAX = 5;

/**
 * Validate + normalise a tasting against its domain invariants (B3): non-empty
 * batch, integer rating within 1-5, optional trimmed note (empty -> null).
 * Returns the normalised value object or throws `TastingValidationError`.
 */
export function createTasting(input: TastingInput): Tasting {
  if (!input.batchId || input.batchId.trim().length === 0) {
    throw new TastingValidationError('batchId is required');
  }
  if (
    !Number.isInteger(input.rating) ||
    input.rating < RATING_MIN ||
    input.rating > RATING_MAX
  ) {
    throw new TastingValidationError(
      `rating must be an integer in [${RATING_MIN}, ${RATING_MAX}]`,
    );
  }

  const trimmedNote = input.note?.trim();
  return {
    batchId: input.batchId,
    rating: input.rating,
    note: trimmedNote && trimmedNote.length > 0 ? trimmedNote : null,
  };
}
