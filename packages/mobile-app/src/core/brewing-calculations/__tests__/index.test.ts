import {
  ALE_PITCH_RATE_M_PER_ML_PLATO,
  calculateAbv,
  calculateAltitudeAdjustedIbuTarget,
  calculateAltitudeIbuCorrectionFactor,
  calculateAverageDiastaticPowerWkPerKg,
  calculateBatchGravityPointsFromFermentables,
  calculateBrewhouseEfficiencyPercent,
  calculateDryYeastPacketsNeeded,
  calculateEstimatedFgFromAttenuation,
  calculateIbuTinseth,
  calculateKegPressurePsiForTargetCo2,
  calculateKolbachIndexPercent,
  calculateMCU,
  calculateOgFromFermentables,
  calculatePrimingSugarGrams,
  calculateRequiredHopGramsForTargetIbu,
  calculateRequiredMaltForTargetSRM,
  calculateRequiredMaltKgForTargetOg,
  calculateRequiredYeastCellsBillions,
  calculateResidualAlkalinity,
  calculateSRMFromMalts,
  calculateSulfateChlorideRatio,
  calculateTargetPreBoilVolumeLiters,
  calculateTinsethUtilization,
  calculateTotalDiastaticPowerWk,
  calculateWaterPlanVolumes,
  calculateWeightedEfmPercent,
  correctSgForTemperature,
  estimateAtmosphericPressureHpa,
  estimateBoilingPointAtAltitudeC,
  estimateFanFromKolbachAndOg,
  estimateMashViscosityCp,
  estimateResidualCo2Volumes,
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

  describe("hop calculations (Tinseth)", () => {
    // Reference: OG 1.050, 60 min
    // bignessFactor = 1.65 × 0.000125^(1.05-1) = 1.65 × 0.000125^0.05 ≈ 1.053
    // boilTimeFactor = (1 - e^(-2.4)) / 4.15 ≈ 0.219 → utilization ≈ 1.053 × 0.219 ≈ 0.231
    const testOg = 1.05;
    const testVolume = 20;

    it("calculates Tinseth utilization for 60 min at OG 1.050", () => {
      const u = calculateTinsethUtilization(60, testOg);

      expect(u).toBeGreaterThan(0.2);
      expect(u).toBeLessThan(0.27);
    });

    it("returns 0 utilization for 0 boil minutes", () => {
      expect(calculateTinsethUtilization(0, testOg)).toBe(0);
    });

    it("returns 0 utilization for invalid gravity", () => {
      expect(calculateTinsethUtilization(60, 0)).toBe(0);
      expect(calculateTinsethUtilization(60, -1)).toBe(0);
    });

    it("higher OG reduces utilization", () => {
      const uLow = calculateTinsethUtilization(60, 1.04);
      const uHigh = calculateTinsethUtilization(60, 1.08);

      expect(uLow).toBeGreaterThan(uHigh);
    });

    it("longer boil increases utilization", () => {
      const u30 = calculateTinsethUtilization(30, testOg);
      const u60 = calculateTinsethUtilization(60, testOg);

      expect(u60).toBeGreaterThan(u30);
    });

    it("calculates required hop grams for a target IBU", () => {
      // 30 IBU, 20 L, OG 1.050, AA 10%, 60 min
      const grams = calculateRequiredHopGramsForTargetIbu(
        30,
        testVolume,
        testOg,
        10,
        60,
      );

      expect(grams).toBeGreaterThan(0);
      expect(grams).toBeLessThan(100);
    });

    it("returns 0 grams for zero target IBU", () => {
      expect(
        calculateRequiredHopGramsForTargetIbu(0, testVolume, testOg, 10, 60),
      ).toBe(0);
    });

    it("returns 0 grams for zero volume", () => {
      expect(calculateRequiredHopGramsForTargetIbu(30, 0, testOg, 10, 60)).toBe(
        0,
      );
    });

    it("returns 0 grams for zero alpha acid", () => {
      expect(
        calculateRequiredHopGramsForTargetIbu(30, testVolume, testOg, 0, 60),
      ).toBe(0);
    });

    it("returns 0 grams for zero boil time (no utilization)", () => {
      expect(
        calculateRequiredHopGramsForTargetIbu(30, testVolume, testOg, 10, 0),
      ).toBe(0);
    });

    it("more grams needed for larger volume at same IBU target", () => {
      const grams20L = calculateRequiredHopGramsForTargetIbu(
        30,
        20,
        testOg,
        10,
        60,
      );
      const grams40L = calculateRequiredHopGramsForTargetIbu(
        30,
        40,
        testOg,
        10,
        60,
      );

      expect(grams40L).toBeCloseTo(grams20L * 2, 1);
    });

    it("round-trips: IBU from calculated grams matches target", () => {
      const targetIbu = 40;
      const grams = calculateRequiredHopGramsForTargetIbu(
        targetIbu,
        testVolume,
        testOg,
        12,
        60,
      );
      const ibu = calculateIbuTinseth(testVolume, testOg, [
        { weightGrams: grams, alphaAcidPercent: 12, boilTimeMinutes: 60 },
      ]);

      expect(ibu).toBeCloseTo(targetIbu, 0);
    });
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

  describe("water calculations", () => {
    describe("calculateResidualAlkalinity", () => {
      // RA = HCO₃⁻ − (Ca²⁺ / 3.5 + Mg²⁺ / 7)
      // Example: HCO₃=50, Ca=75, Mg=10 → RA = 50 − (21.43 + 1.43) ≈ 27.14

      it("calculates RA for a typical Pale Ale profile", () => {
        const ra = calculateResidualAlkalinity(50, 75, 10);

        expect(ra).toBeCloseTo(27.14, 1);
      });

      it("returns negative RA for soft water (suited for pale beers)", () => {
        // RA = 20 − (150/3.5 + 5/7) = 20 − 43.57 ≈ −23.57
        const ra = calculateResidualAlkalinity(20, 150, 5);

        expect(ra).toBeLessThan(0);
      });

      it("returns positive RA for high bicarbonate water (suited for dark beers)", () => {
        // RA = 200 − (50/3.5 + 10/7) = 200 − 15.71 ≈ 184.3
        const ra = calculateResidualAlkalinity(200, 50, 10);

        expect(ra).toBeGreaterThan(100);
      });

      it("treats negative Ca/Mg as 0 in the denominator correction", () => {
        // Negative ions are clamped to 0 → RA = HCO₃
        const ra = calculateResidualAlkalinity(100, -10, -5);

        expect(ra).toBe(100);
      });

      it("treats negative HCO₃ as 0 in the alkalinity term", () => {
        const raWithNegativeHco3 = calculateResidualAlkalinity(-50, 75, 10);
        const raWithZeroHco3 = calculateResidualAlkalinity(0, 75, 10);

        expect(raWithNegativeHco3).toBeCloseTo(raWithZeroHco3, 5);
      });

      it("returns 0 for NaN inputs", () => {
        expect(calculateResidualAlkalinity(NaN, 75, 10)).toBe(0);
        expect(calculateResidualAlkalinity(50, NaN, 10)).toBe(0);
        expect(calculateResidualAlkalinity(50, 75, NaN)).toBe(0);
      });

      it("higher Ca reduces RA (Ca acidifies mash)", () => {
        const raLowCa = calculateResidualAlkalinity(100, 50, 10);
        const raHighCa = calculateResidualAlkalinity(100, 200, 10);

        expect(raHighCa).toBeLessThan(raLowCa);
      });
    });

    describe("calculateSulfateChlorideRatio", () => {
      it("returns 1.0 for equal SO₄ and Cl", () => {
        expect(calculateSulfateChlorideRatio(100, 100)).toBeCloseTo(1.0, 5);
      });

      it("returns high ratio for IPA-style water (SO₄-heavy)", () => {
        expect(calculateSulfateChlorideRatio(250, 50)).toBeCloseTo(5.0, 5);
      });

      it("returns ratio below 1 for malt-forward profile (Cl-heavy)", () => {
        expect(calculateSulfateChlorideRatio(50, 150)).toBeCloseTo(0.333, 2);
      });

      it("returns 0 when chloride is 0", () => {
        expect(calculateSulfateChlorideRatio(100, 0)).toBe(0);
      });

      it("returns 0 when both SO₄ and Cl are 0", () => {
        expect(calculateSulfateChlorideRatio(0, 0)).toBe(0);
      });

      it("returns 0 when SO₄ is 0 (no sulfate)", () => {
        expect(calculateSulfateChlorideRatio(0, 100)).toBe(0);
      });

      it("higher SO₄ increases ratio", () => {
        const ratioLow = calculateSulfateChlorideRatio(100, 100);
        const ratioHigh = calculateSulfateChlorideRatio(300, 100);

        expect(ratioHigh).toBeGreaterThan(ratioLow);
      });
    });
  });

  describe("rendement calculations", () => {
    it("calculates brewhouse efficiency from measured OG and volume", () => {
      const efficiency = calculateBrewhouseEfficiencyPercent(1.06, 20, [
        { weightKg: 4, ppg: 37.5 },
        { weightKg: 0.3, ppg: 33 },
      ]);

      expect(efficiency).toBeCloseTo(75.0, 1);
    });

    it("calculates target pre-boil volume from process losses", () => {
      const preBoil = calculateTargetPreBoilVolumeLiters(20, 4, 1, 4);

      expect(preBoil).toBeCloseTo(25.88, 2);
    });

    it("calculates mash/sparge/total water plan volumes", () => {
      const plan = calculateWaterPlanVolumes(5, 3, 20, 4, 1, 0.8, 4);

      expect(plan.mashWaterLiters).toBeCloseTo(15, 2);
      expect(plan.preBoilVolumeLiters).toBeCloseTo(25.88, 2);
      expect(plan.totalWaterLiters).toBeCloseTo(29.88, 2);
      expect(plan.spargeWaterLiters).toBeCloseTo(14.875, 3);
    });
  });

  describe("yeast calculations", () => {
    it("calculates required yeast cells in billions", () => {
      const cells = calculateRequiredYeastCellsBillions(
        1.065,
        20,
        ALE_PITCH_RATE_M_PER_ML_PLATO,
      );

      expect(cells).toBeGreaterThan(230);
      expect(cells).toBeLessThan(250);
    });

    it("estimates FG from attenuation", () => {
      const fg = calculateEstimatedFgFromAttenuation(1.065, 80);

      expect(fg).toBeCloseTo(1.013, 3);
    });

    it("calculates dry yeast packets needed with viability", () => {
      const packets = calculateDryYeastPacketsNeeded(240, 200, 95);

      expect(packets).toBeCloseTo(1.26, 2);
    });
  });

  describe("carbonation calculations", () => {
    it("estimates residual CO2 from beer temperature", () => {
      const residual = estimateResidualCo2Volumes(20);

      expect(residual).toBeGreaterThan(0.8);
      expect(residual).toBeLessThan(0.9);
    });

    it("calculates dextrose priming sugar from target and residual CO2", () => {
      const sugar = calculatePrimingSugarGrams(2.4, 20, 20, "dextrose");

      expect(sugar).toBeGreaterThan(120);
      expect(sugar).toBeLessThan(126);
    });

    it("requires less sucrose than dextrose for the same target", () => {
      const dextrose = calculatePrimingSugarGrams(2.4, 20, 20, "dextrose");
      const sucrose = calculatePrimingSugarGrams(2.4, 20, 20, "sucrose");

      expect(sucrose).toBeLessThan(dextrose);
    });

    it("calculates keg pressure for target carbonation", () => {
      const psi = calculateKegPressurePsiForTargetCo2(2.4, 4);

      expect(psi).toBeGreaterThan(8);
      expect(psi).toBeLessThan(14);
    });
  });

  describe("advanced calculations", () => {
    it("calculates total and average diastatic power", () => {
      const malts = [
        { weightKg: 4, diastaticPowerWk: 250 },
        { weightKg: 1, diastaticPowerWk: 0 },
      ];

      expect(calculateTotalDiastaticPowerWk(malts)).toBeCloseTo(1000, 5);
      expect(calculateAverageDiastaticPowerWkPerKg(malts)).toBeCloseTo(200, 5);
    });

    it("calculates Kolbach index", () => {
      const kolbach = calculateKolbachIndexPercent(0.72, 1.8);

      expect(kolbach).toBeCloseTo(40, 5);
    });

    it("estimates mash viscosity from beta-glucans", () => {
      const viscosity = estimateMashViscosityCp(200);

      expect(viscosity).toBeCloseTo(4.2, 2);
    });

    it("estimates FAN from Kolbach and OG", () => {
      const fan = estimateFanFromKolbachAndOg(40, 1.06);

      expect(fan).toBeCloseTo(480, 1);
    });

    it("estimates boiling point and atmospheric pressure with altitude", () => {
      expect(estimateBoilingPointAtAltitudeC(1500)).toBeCloseTo(95, 5);
      expect(estimateAtmosphericPressureHpa(1500)).toBeCloseTo(836.5, 1);
    });

    it("applies IBU correction for altitude", () => {
      expect(calculateAltitudeIbuCorrectionFactor(1500)).toBeCloseTo(1.125, 5);
      expect(calculateAltitudeAdjustedIbuTarget(40, 1500)).toBeCloseTo(45, 5);
    });
  });
});
