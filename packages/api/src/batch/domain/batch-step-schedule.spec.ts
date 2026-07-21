import { RecipeStepType } from '../../recipe/domain/enums/recipe-step-type.enum';
import {
  computeStepDueAt,
  isQualityCriticalType,
} from './batch-step-schedule';

describe('isQualityCriticalType', () => {
  it('flags the biological/packaging phases as critical', () => {
    expect(isQualityCriticalType(RecipeStepType.FERMENTATION)).toBe(true);
    expect(isQualityCriticalType(RecipeStepType.PACKAGING)).toBe(true);
  });

  it('does not flag the process phases', () => {
    expect(isQualityCriticalType(RecipeStepType.MASH)).toBe(false);
    expect(isQualityCriticalType(RecipeStepType.BOIL)).toBe(false);
    expect(isQualityCriticalType(RecipeStepType.WHIRLPOOL)).toBe(false);
  });

  it('covers every RecipeStepType (guards against an unclassified new member)', () => {
    for (const type of Object.values(RecipeStepType)) {
      expect(typeof isQualityCriticalType(type)).toBe('boolean');
    }
  });
});

describe('computeStepDueAt', () => {
  it('adds the planned duration (minutes) to the start instant', () => {
    const due = computeStepDueAt({
      started_at: new Date('2026-07-01T10:00:00.000Z'),
      planned_duration_min: 90,
    });
    expect(due).toEqual(new Date('2026-07-01T11:30:00.000Z'));
  });

  it('returns null when the step has not started', () => {
    expect(
      computeStepDueAt({ started_at: null, planned_duration_min: 60 }),
    ).toBeNull();
  });

  it('returns null when the step carries no planned duration', () => {
    expect(
      computeStepDueAt({
        started_at: new Date('2026-07-01T10:00:00.000Z'),
        planned_duration_min: null,
      }),
    ).toBeNull();
  });

  it('treats a zero planned duration as due at the start instant (not null)', () => {
    const startedAt = new Date('2026-07-01T10:00:00.000Z');
    expect(
      computeStepDueAt({ started_at: startedAt, planned_duration_min: 0 }),
    ).toEqual(startedAt);
  });

  it('returns null for a null/undefined step', () => {
    expect(computeStepDueAt(null)).toBeNull();
    expect(computeStepDueAt(undefined)).toBeNull();
  });
});
