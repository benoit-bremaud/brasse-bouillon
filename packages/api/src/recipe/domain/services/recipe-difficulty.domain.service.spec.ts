import { RecipeDifficultyDomainService } from './recipe-difficulty.domain.service';
import { RecipeDifficultyLevel } from '../enums/recipe-difficulty-level.enum';
import { RecipeYeastType } from '../enums/recipe-yeast-type.enum';

const compute = (
  input: Parameters<typeof RecipeDifficultyDomainService.compute>[0],
) => RecipeDifficultyDomainService.compute(input);

const ale = { type: RecipeYeastType.ALE };
const lager = { type: RecipeYeastType.LAGER };

describe('RecipeDifficultyDomainService — worked examples (spec §5)', () => {
  it('Blonde SMaSH → Facile', () => {
    expect(
      compute({
        yeast: ale,
        ogTarget: 1.046,
        ebcTarget: 8,
        distinctFermentables: 2,
        distinctHopVarieties: 1,
      }).computed,
    ).toBe(RecipeDifficultyLevel.FACILE);
  });

  it('American Pale Ale (hoppy, 2 hop varieties) → Facile', () => {
    expect(
      compute({
        yeast: ale,
        ogTarget: 1.052,
        ebcTarget: 12,
        distinctFermentables: 3,
        distinctHopVarieties: 2,
      }).computed,
    ).toBe(RecipeDifficultyLevel.FACILE);
  });

  it('Bohemian Pilsner (pale lager) → Avancé', () => {
    expect(
      compute({ yeast: lager, ogTarget: 1.05, ebcTarget: 6 }).computed,
    ).toBe(RecipeDifficultyLevel.AVANCE);
  });

  it('Italian Pilsner / IPL (hoppy pale lager) → Avancé — hops do not make a lager easier', () => {
    expect(
      compute({
        yeast: lager,
        ogTarget: 1.052,
        ebcTarget: 7,
        distinctHopVarieties: 2,
      }).computed,
    ).toBe(RecipeDifficultyLevel.AVANCE);
  });

  it('Saison (hot ferment 30 °C) → Intermédiaire — no longer a false Facile', () => {
    expect(
      compute({
        yeast: { type: RecipeYeastType.ALE, temperatureMaxC: 30 },
        ogTarget: 1.054,
      }).computed,
    ).toBe(RecipeDifficultyLevel.INTERMEDIAIRE);
  });

  it('Amber kit + one gypsum sachet (no target) → Facile', () => {
    expect(
      compute({
        yeast: ale,
        ogTarget: 1.048,
        water: { calciumPpm: 50 },
      }).computed,
    ).toBe(RecipeDifficultyLevel.FACILE);
  });

  it('Russian Imperial Stout (high gravity) → Avancé', () => {
    const result = compute({
      yeast: ale,
      ogTarget: 1.095,
      ebcTarget: 80,
      water: { phTarget: 5.4 },
      distinctFermentables: 6,
      distinctHopVarieties: 3,
    });
    expect(result.computed).toBe(RecipeDifficultyLevel.AVANCE);
    // Reasons name the dominant factor first (F2 tier 2), then the tier-1 ones.
    expect(result.reasons.map((r) => r.factor)).toEqual(['F2', 'F4', 'F6']);
  });

  it('Decoction Strong Bock → Avancé via bounded compounding (≥3 tier-1 factors)', () => {
    expect(
      compute({
        yeast: lager, // F1 = 1
        ogTarget: 1.07, // F2 = 1
        ebcTarget: 30, // F3 = 0 (not pale)
        water: { phTarget: 5.4 }, // F4 = 1
        distinctFermentables: 5,
        distinctHopVarieties: 3, // complexity 8 → F6 = 1
      }).computed,
    ).toBe(RecipeDifficultyLevel.AVANCE);
  });

  it('Brett IPA (wild culture) → Avancé', () => {
    expect(compute({ yeast: { type: RecipeYeastType.BRETT } }).computed).toBe(
      RecipeDifficultyLevel.AVANCE,
    );
  });
});

describe('RecipeDifficultyDomainService — factor rules & edges', () => {
  it('a fully sparse recipe (all null) → Facile, with a stored positive reason', () => {
    const result = compute({});
    expect(result.computed).toBe(RecipeDifficultyLevel.FACILE);
    expect(result.reasons).toHaveLength(1);
    expect(result.reasons[0].factor).toBe('facile');
    expect(result.reasons[0].sentence).toMatch(/accessible/i);
  });

  it('F3 does NOT fire on a pale ALE (fault-tolerance is lager-gated)', () => {
    expect(
      compute({ yeast: ale, ogTarget: 1.045, ebcTarget: 5 }).computed,
    ).toBe(RecipeDifficultyLevel.FACILE);
  });

  it('F3 does NOT fire on a dark lager (EBC > 10) — only pale lagers', () => {
    // Dark lager: F1 lager floor = Intermédiaire, F3 off.
    expect(
      compute({ yeast: lager, ogTarget: 1.048, ebcTarget: 35 }).computed,
    ).toBe(RecipeDifficultyLevel.INTERMEDIAIRE);
  });

  it('F4 fires on a pH target but not on a single ion target', () => {
    expect(compute({ yeast: ale, water: { phTarget: 5.4 } }).computed).toBe(
      RecipeDifficultyLevel.INTERMEDIAIRE,
    );
    expect(compute({ yeast: ale, water: { sulfatePpm: 200 } }).computed).toBe(
      RecipeDifficultyLevel.FACILE,
    );
    // Two ion targets → fires.
    expect(
      compute({ yeast: ale, water: { sulfatePpm: 200, chloridePpm: 50 } })
        .computed,
    ).toBe(RecipeDifficultyLevel.INTERMEDIAIRE);
  });

  it('compounding needs ≥3 tier-1 factors: exactly 2 stays Intermédiaire', () => {
    // Dark lager (F1=1) + moderate gravity (F2=1) = 2 tier-1, base 1, no bump.
    expect(
      compute({ yeast: lager, ogTarget: 1.06, ebcTarget: 40 }).computed,
    ).toBe(RecipeDifficultyLevel.INTERMEDIAIRE);
  });

  it('high gravity alone (F2=2) → Avancé without any compounding', () => {
    expect(compute({ yeast: ale, ogTarget: 1.09 }).computed).toBe(
      RecipeDifficultyLevel.AVANCE,
    );
  });

  it('derives the gravity band from ABV when OG is absent', () => {
    expect(compute({ yeast: ale, abvEstimated: 4.5 }).computed).toBe(
      RecipeDifficultyLevel.FACILE,
    );
    expect(compute({ yeast: ale, abvEstimated: 9 }).computed).toBe(
      RecipeDifficultyLevel.AVANCE,
    );
  });
});
