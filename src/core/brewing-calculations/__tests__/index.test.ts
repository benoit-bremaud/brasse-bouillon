import {
  calculateAbv,
  calculateIbuTinseth,
  gallonsToLiters,
  litersToGallons,
  platoToSg,
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
});
