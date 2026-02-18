import {
  calculateAbv,
  calculateBatchGravityPointsFromFermentables,
  calculateIbuTinseth,
  calculateMCU,
  calculateOgFromFermentables,
  calculateRequiredMaltForTargetSRM,
  calculateRequiredMaltKgForTargetOg,
  calculateSRMFromMalts,
  calculateWeightedEfmPercent,
  correctSgForTemperature,
  gallonsToLiters,
  litersToGallons,
  mcuToSRM,
  ogToPoints,
  platoToSg,
  pointsToOg,
  sgToPlato,
  srmToEBC,
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

  describe("color calculations", () => {
    // MCU = (weight_lbs × lovibond) / volume_gallons
    // 4 kg Pilsner (2°L) + 0.5 kg Cara 50 (50°L) in 20 L
    // weight_lbs: 4 × 2.2046 = 8.8185, 0.5 × 2.2046 = 1.1023
    // volume_gallons: 20 / 3.78541 ≈ 5.2834
    // MCU = (8.8185 × 2 + 1.1023 × 50) / 5.2834 ≈ 72.75 / 5.2834 ≈ 13.77
    const testMalts = [
      { weightKg: 4, lovibond: 2 },
      { weightKg: 0.5, lovibond: 50 },
    ];
    const testVolumeLiters = 20;

    it("calculates MCU from malts and volume", () => {
      const mcu = calculateMCU(testMalts, testVolumeLiters);

      expect(mcu).toBeGreaterThan(13);
      expect(mcu).toBeLessThan(15);
    });

    it("returns 0 MCU for zero volume", () => {
      const mcu = calculateMCU(testMalts, 0);

      expect(mcu).toBe(0);
    });

    it("returns 0 MCU for empty malt list", () => {
      const mcu = calculateMCU([], testVolumeLiters);

      expect(mcu).toBe(0);
    });

    it("converts MCU to SRM using Morey equation", () => {
      // SRM = 1.4922 × MCU^0.6859
      // MCU ≈ 13.77 → SRM ≈ 9
      const srm = mcuToSRM(13.77);

      expect(srm).toBeGreaterThan(8);
      expect(srm).toBeLessThan(10);
    });

    it("returns 0 SRM for zero or negative MCU", () => {
      expect(mcuToSRM(0)).toBe(0);
      expect(mcuToSRM(-5)).toBe(0);
    });

    it("converts SRM to EBC (× 1.97)", () => {
      const ebc = srmToEBC(10);

      expect(ebc).toBeCloseTo(19.7, 2);
    });

    it("returns 0 EBC for zero SRM", () => {
      expect(srmToEBC(0)).toBe(0);
    });

    it("calculates SRM directly from malts and volume", () => {
      const srm = calculateSRMFromMalts(testMalts, testVolumeLiters);

      expect(srm).toBeGreaterThan(8);
      expect(srm).toBeLessThan(10);
    });

    it("returns 0 SRM for zero volume", () => {
      const srm = calculateSRMFromMalts(testMalts, 0);

      expect(srm).toBe(0);
    });

    it("calculates required malt kg for a target SRM", () => {
      // Target SRM 20, 20 L, lovibond 50
      const kg = calculateRequiredMaltForTargetSRM(20, 20, 50);

      expect(kg).toBeGreaterThan(0);
      expect(kg).toBeLessThan(5);
    });

    it("returns 0 for invalid inputs in calculateRequiredMaltForTargetSRM", () => {
      expect(calculateRequiredMaltForTargetSRM(0, 20, 50)).toBe(0);
      expect(calculateRequiredMaltForTargetSRM(20, 0, 50)).toBe(0);
      expect(calculateRequiredMaltForTargetSRM(20, 20, 0)).toBe(0);
    });

    it("produces higher SRM for darker malts at same weight", () => {
      const lightSrm = calculateSRMFromMalts(
        [{ weightKg: 1, lovibond: 2 }],
        20,
      );
      const darkSrm = calculateSRMFromMalts(
        [{ weightKg: 1, lovibond: 350 }],
        20,
      );

      expect(darkSrm).toBeGreaterThan(lightSrm);
    });

    it("produces higher SRM for larger malt weight at same lovibond", () => {
      const lightSrm = calculateSRMFromMalts(
        [{ weightKg: 1, lovibond: 40 }],
        20,
      );
      const darkSrm = calculateSRMFromMalts(
        [{ weightKg: 4, lovibond: 40 }],
        20,
      );

      expect(darkSrm).toBeGreaterThan(lightSrm);
    });
  });
});
