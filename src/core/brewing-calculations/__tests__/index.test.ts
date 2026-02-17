import {
  calculateAbv,
  calculateBatchGravityPointsFromFermentables,
  calculateIbuTinseth,
  calculateOgFromFermentables,
  calculateRequiredMaltKgForTargetOg,
  calculateWeightedEfmPercent,
  correctSgForTemperature,
  gallonsToLiters,
  litersToGallons,
  ogToPoints,
  platoToSg,
  pointsToOg,
  sgToPlato,
} from "@/core/brewing-calculations";

describe("brewing calculations", () => {
  it("calculates ABV from OG/FG", () => {
    const abv = calculateAbv(1.052, 1.01);

    expect(abv).toBeCloseTo(5.51, 2);
  });

  it("calculates IBU Tinseth for one hop addition", () => {
    const ibu = calculateIbuTinseth(20, 1.05, [
      {
        weightGrams: 25,
        alphaAcidPercent: 10,
        boilTimeMinutes: 60,
      },
    ]);

    expect(ibu).toBeGreaterThan(20);
    expect(ibu).toBeLessThan(35);
  });

  it("converts SG and Plato", () => {
    const plato = sgToPlato(1.05);
    const sg = platoToSg(plato);

    expect(plato).toBeGreaterThan(12);
    expect(plato).toBeLessThan(13);
    expect(sg).toBeCloseTo(1.05, 3);
  });

  it("converts liters and gallons", () => {
    const gallons = litersToGallons(20);
    const liters = gallonsToLiters(gallons);

    expect(gallons).toBeCloseTo(5.28, 2);
    expect(liters).toBeCloseTo(20, 3);
  });

  it("calculates OG from fermentables with brewhouse efficiency", () => {
    const og = calculateOgFromFermentables(
      [
        { weightKg: 4, ppg: 37.5, efmPercent: 82 },
        { weightKg: 0.3, ppg: 33, efmPercent: 80 },
      ],
      20,
      75,
    );

    expect(og).toBeGreaterThan(1.059);
    expect(og).toBeLessThan(1.061);
  });

  it("calculates total batch gravity points from fermentables", () => {
    const points = calculateBatchGravityPointsFromFermentables(
      [
        { weightKg: 4, ppg: 37.5 },
        { weightKg: 0.3, ppg: 33 },
      ],
      75,
    );

    expect(points).toBeGreaterThan(119);
    expect(points).toBeLessThan(121);
  });

  it("calculates required malt mass for a target OG", () => {
    const kg = calculateRequiredMaltKgForTargetOg(1.065, 20, 75, 37.5);

    expect(kg).toBeGreaterThan(4.6);
    expect(kg).toBeLessThan(4.7);
  });

  it("calculates weighted EFM", () => {
    const efm = calculateWeightedEfmPercent([
      { weightKg: 4, ppg: 37.5, efmPercent: 82 },
      { weightKg: 0.3, ppg: 33, efmPercent: 80 },
    ]);

    expect(efm).toBeCloseTo(81.86, 2);
  });

  it("converts OG and points", () => {
    expect(ogToPoints(1.065)).toBeCloseTo(65, 5);
    expect(pointsToOg(65)).toBeCloseTo(1.065, 5);
  });

  it("corrects SG at higher measurement temperature", () => {
    const corrected = correctSgForTemperature(1.065, 25);

    expect(corrected).toBeGreaterThan(1.065);
    expect(corrected).toBeLessThan(1.067);
  });
});
