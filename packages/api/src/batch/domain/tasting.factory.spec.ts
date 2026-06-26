import { createTasting, TastingValidationError } from './tasting.factory';

describe('createTasting', () => {
  // Happy path
  it('builds a normalised tasting for a valid rating + note', () => {
    const t = createTasting({ batchId: 'b-1', rating: 4, note: '  Fruité  ' });
    expect(t).toEqual({ batchId: 'b-1', rating: 4, note: 'Fruité' });
  });

  // Happy path: empty/whitespace note becomes null
  it('normalises an empty or whitespace note to null', () => {
    expect(
      createTasting({ batchId: 'b-1', rating: 3, note: '   ' }).note,
    ).toBeNull();
    expect(createTasting({ batchId: 'b-1', rating: 3 }).note).toBeNull();
  });

  // Edge: rating bounds are inclusive
  it('accepts the inclusive 1 and 5 bounds', () => {
    expect(createTasting({ batchId: 'b-1', rating: 1 }).rating).toBe(1);
    expect(createTasting({ batchId: 'b-1', rating: 5 }).rating).toBe(5);
  });

  // Sad path: rating out of range
  it('rejects a rating below 1 or above 5', () => {
    expect(() => createTasting({ batchId: 'b-1', rating: 0 })).toThrow(
      TastingValidationError,
    );
    expect(() => createTasting({ batchId: 'b-1', rating: 6 })).toThrow(
      TastingValidationError,
    );
  });

  // Sad path: non-integer rating
  it('rejects a non-integer rating', () => {
    expect(() => createTasting({ batchId: 'b-1', rating: 3.5 })).toThrow(
      TastingValidationError,
    );
  });

  // Sad path: missing batch id
  it('rejects a missing batch id', () => {
    expect(() => createTasting({ batchId: '  ', rating: 3 })).toThrow(
      TastingValidationError,
    );
  });
});
