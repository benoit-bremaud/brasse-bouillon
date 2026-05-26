import {
  createMeasurement,
  MeasurementValidationError,
} from './measurement.factory';
import { MeasurementType } from './enums/measurement-type.enum';

describe('createMeasurement', () => {
  // Happy path
  it('builds a normalised measurement for a valid gravity reading', () => {
    const takenAt = new Date('2026-05-20T10:00:00.000Z');
    const m = createMeasurement({
      batchId: 'b-1',
      type: MeasurementType.OG,
      value: 1.048,
      stepOrder: 2,
      unit: 'SG',
      takenAt,
    });

    expect(m).toEqual({
      batchId: 'b-1',
      type: MeasurementType.OG,
      value: 1.048,
      stepOrder: 2,
      unit: 'SG',
      takenAt,
    });
  });

  // Happy path: optional fields default
  it('defaults stepOrder/unit to null and takenAt to now', () => {
    const before = Date.now();
    const m = createMeasurement({
      batchId: 'b-1',
      type: MeasurementType.TEMPERATURE,
      value: 19,
    });

    expect(m.stepOrder).toBeNull();
    expect(m.unit).toBeNull();
    expect(m.takenAt.getTime()).toBeGreaterThanOrEqual(before);
  });

  // Sad path: missing batch
  it('rejects an empty batchId', () => {
    expect(() =>
      createMeasurement({
        batchId: ' ',
        type: MeasurementType.FG,
        value: 1.01,
      }),
    ).toThrow(MeasurementValidationError);
  });

  // Sad path: non-finite value
  it('rejects a non-finite value', () => {
    expect(() =>
      createMeasurement({
        batchId: 'b-1',
        type: MeasurementType.PH,
        value: Number.NaN,
      }),
    ).toThrow(/finite/);
  });

  // Edge: out-of-range per type
  it.each([
    [MeasurementType.OG, 1.5], // gravity too high
    [MeasurementType.TEMPERATURE, 200], // temp too high
    [MeasurementType.PH, 15], // pH out of 0..14
  ])('rejects %s value %p as out of range', (type, value) => {
    expect(() => createMeasurement({ batchId: 'b-1', type, value })).toThrow(
      /out of range/,
    );
  });

  // Edge: negative / non-integer stepOrder
  it('rejects a negative or non-integer stepOrder', () => {
    expect(() =>
      createMeasurement({
        batchId: 'b-1',
        type: MeasurementType.FG,
        value: 1.012,
        stepOrder: -1,
      }),
    ).toThrow(/stepOrder/);
  });

  // Edge: gravity boundary is accepted
  it('accepts the gravity lower boundary', () => {
    const m = createMeasurement({
      batchId: 'b-1',
      type: MeasurementType.SG_SPOT,
      value: 0.99,
    });
    expect(m.value).toBe(0.99);
  });
});
