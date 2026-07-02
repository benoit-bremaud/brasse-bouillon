import { RecipeStepType } from '../../../recipe/domain/enums/recipe-step-type.enum';

import { getStepGuidance } from './step-guidance';

describe('getStepGuidance', () => {
  it('returns a tip and a default duration for time-boxed steps (happy)', () => {
    const mash = getStepGuidance(RecipeStepType.MASH);
    expect(mash?.pedagogicalTip.length).toBeGreaterThan(0);
    expect(mash?.plannedDurationMin).toBe(60);

    expect(getStepGuidance(RecipeStepType.BOIL)?.plannedDurationMin).toBe(60);
    expect(getStepGuidance(RecipeStepType.WHIRLPOOL)?.plannedDurationMin).toBe(
      15,
    );
  });

  it('returns a tip but no duration for over-days steps (edge: fermentation, packaging)', () => {
    const ferment = getStepGuidance(RecipeStepType.FERMENTATION);
    expect(ferment?.pedagogicalTip.length).toBeGreaterThan(0);
    expect(ferment?.plannedDurationMin).toBeNull();

    const packaging = getStepGuidance(RecipeStepType.PACKAGING);
    expect(packaging?.pedagogicalTip.length).toBeGreaterThan(0);
    expect(packaging?.plannedDurationMin).toBeNull();
  });

  it('covers every RecipeStepType with a non-empty tip (coverage)', () => {
    for (const type of Object.values(RecipeStepType)) {
      const guidance = getStepGuidance(type);
      expect(guidance).toBeDefined();
      expect(guidance?.pedagogicalTip.trim().length).toBeGreaterThan(0);
    }
  });

  it('returns undefined for an unknown step type (sad/edge)', () => {
    expect(getStepGuidance('barrel-aging' as RecipeStepType)).toBeUndefined();
  });

  it('carries PRÉP actions with a gesture AND its pedagogical why on brewing steps (happy, F4)', () => {
    const prepTypes = [
      RecipeStepType.MASH,
      RecipeStepType.BOIL,
      RecipeStepType.WHIRLPOOL,
      RecipeStepType.FERMENTATION,
    ];
    for (const type of prepTypes) {
      const actions = getStepGuidance(type)?.prepActions ?? [];
      expect(actions.length).toBeGreaterThan(0);
      for (const prep of actions) {
        // The app teaches: a gesture without its why is executing, not learning.
        expect(prep.action.trim().length).toBeGreaterThan(0);
        expect(prep.why.trim().length).toBeGreaterThan(0);
      }
    }
  });

  it('carries NO PRÉP actions for packaging — the B3 bottling gate covers it (edge)', () => {
    expect(getStepGuidance(RecipeStepType.PACKAGING)?.prepActions).toEqual([]);
  });
});
