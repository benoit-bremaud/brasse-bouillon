import {
  computePrecisePriming,
  computeSimplePriming,
  DEFAULT_G_PER_L,
  DEFAULT_TARGET_CO2_VOL,
  SAFETY_WARNING,
  SugarType,
} from './priming-calculator';

describe('computeSimplePriming', () => {
  // Happy path
  it('computes the default ~6.5 g/L table-sugar dose for a typical volume', () => {
    const result = computeSimplePriming(4.3);

    expect(result.sugarGrams).toBe(28); // 4.3 * 6.5 = 27.95 -> 28.0
    expect(result.sugarType).toBe(SugarType.TABLE_SUGAR);
    expect(result.targetCo2Vol).toBe(DEFAULT_TARGET_CO2_VOL);
    expect(result.volumeL).toBe(4.3);
  });

  // Happy path: scales linearly with the volume
  it('scales the dose linearly with the volume', () => {
    expect(computeSimplePriming(20).sugarGrams).toBe(20 * DEFAULT_G_PER_L);
  });

  // Edge: zero volume yields a zero dose, never NaN
  it('returns a zero dose for a zero volume', () => {
    const result = computeSimplePriming(0);
    expect(result.sugarGrams).toBe(0);
    expect(result.volumeL).toBe(0);
  });

  // Edge: rounds to one decimal place
  it('rounds the dose to one decimal place', () => {
    // 3.33 * 6.5 = 21.645 -> 21.6
    expect(computeSimplePriming(3.33).sugarGrams).toBe(21.6);
  });

  // Sad path: invalid volume is rejected
  it('throws for a negative or non-finite volume', () => {
    expect(() => computeSimplePriming(-1)).toThrow();
    expect(() => computeSimplePriming(Number.NaN)).toThrow();
  });
});

describe('computePrecisePriming', () => {
  // Happy path + temperature conversion
  it('applies the residual-CO2 formula at a given beer temperature', () => {
    // 20 L, target 2.4 vol, beer at 20°C (68°F):
    // residual ≈ 0.8615 vol -> remaining ≈ 1.5385 vol
    // 20 * 4.13 * 1.5385 ≈ 127.08 -> 127.1 g
    const result = computePrecisePriming(20, 2.4, 20);
    expect(result.sugarGrams).toBe(127.1);
    expect(result.targetCo2Vol).toBe(2.4);
    expect(result.sugarType).toBe(SugarType.TABLE_SUGAR);
    expect(result.volumeL).toBe(20);
  });

  // Edge: a colder beer holds more CO2, so it needs less sugar
  it('requires less sugar for a colder beer (more residual CO2)', () => {
    const cold = computePrecisePriming(20, 2.4, 4);
    const warm = computePrecisePriming(20, 2.4, 25);
    expect(cold.sugarGrams).toBeLessThan(warm.sugarGrams);
  });

  // Edge: residual clamp — target below the residual yields a zero dose
  it('clamps at zero when the target is below the residual CO2', () => {
    // At 0°C the beer already holds well over 1.0 vol, so target 1.0 -> 0 g.
    const result = computePrecisePriming(20, 1.0, 0);
    expect(result.sugarGrams).toBe(0);
  });

  // Sad path: invalid inputs are rejected
  it('throws for invalid volume, target, or temperature', () => {
    expect(() => computePrecisePriming(-1, 2.4, 20)).toThrow();
    expect(() => computePrecisePriming(20, -0.1, 20)).toThrow();
    expect(() => computePrecisePriming(20, 2.4, Number.NaN)).toThrow();
  });
});

describe('SAFETY_WARNING', () => {
  it('warns (in French) about over-pressure / exploding bottles', () => {
    expect(SAFETY_WARNING).toContain('EXPLOSER');
    expect(SAFETY_WARNING.length).toBeGreaterThan(20);
  });
});
