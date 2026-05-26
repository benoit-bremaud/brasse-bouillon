import {
  createObservation,
  ObservationValidationError,
} from './observation.factory';

describe('createObservation', () => {
  // Happy path
  it('builds a normalised observation with all fields', () => {
    const observedAt = new Date('2026-05-20T18:00:00.000Z');
    const o = createObservation({
      batchId: 'b-1',
      freeText: '  Krausen bien formé, odeur fruitée  ',
      stepOrder: 3,
      photoRefs: ['photos/1.jpg'],
      moodScore: 4,
      observedAt,
    });

    expect(o).toEqual({
      batchId: 'b-1',
      freeText: 'Krausen bien formé, odeur fruitée', // trimmed
      stepOrder: 3,
      photoRefs: ['photos/1.jpg'],
      moodScore: 4,
      observedAt,
    });
  });

  // Happy path: optional fields default
  it('defaults stepOrder/moodScore to null, photoRefs to [], observedAt to now', () => {
    const before = Date.now();
    const o = createObservation({ batchId: 'b-1', freeText: 'note' });

    expect(o.stepOrder).toBeNull();
    expect(o.moodScore).toBeNull();
    expect(o.photoRefs).toEqual([]);
    expect(o.observedAt.getTime()).toBeGreaterThanOrEqual(before);
  });

  // Sad path: empty free text
  it('rejects empty free text', () => {
    expect(() =>
      createObservation({ batchId: 'b-1', freeText: '   ' }),
    ).toThrow(ObservationValidationError);
  });

  // Sad path: missing batch
  it('rejects an empty batchId', () => {
    expect(() => createObservation({ batchId: '', freeText: 'note' })).toThrow(
      /batchId/,
    );
  });

  // Edge: mood score out of range
  it.each([0, 6, 2.5])('rejects mood score %p', (moodScore) => {
    expect(() =>
      createObservation({ batchId: 'b-1', freeText: 'note', moodScore }),
    ).toThrow(/moodScore/);
  });

  // Edge: blank photo ref
  it('rejects a blank photo ref', () => {
    expect(() =>
      createObservation({
        batchId: 'b-1',
        freeText: 'note',
        photoRefs: ['ok', '  '],
      }),
    ).toThrow(/photoRefs/);
  });

  // Edge: negative stepOrder
  it('rejects a negative stepOrder', () => {
    expect(() =>
      createObservation({ batchId: 'b-1', freeText: 'note', stepOrder: -2 }),
    ).toThrow(/stepOrder/);
  });
});
