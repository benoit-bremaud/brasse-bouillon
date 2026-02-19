export type HopAddition = {
  weightGrams: number;
  alphaAcidPercent: number;
  boilTimeMinutes: number;
};

export type FermentableInput = {
  weightKg: number;
  ppg: number;
  efmPercent?: number;
  lovibond?: number;
};

export type ColorMaltInput = {
  weightKg: number;
  lovibond: number;
};

const LITERS_REFERENCE_FOR_PPG = 10;
const HYDROMETER_CALIBRATION_C = 20;

function clampPositive(value: number) {
  if (!Number.isFinite(value) || value < 0) {
    return 0;
  }
  return value;
}

function toPercentFraction(value: number) {
  const bounded = clampPositive(value);
  if (bounded <= 1) {
    return bounded;
  }

  return bounded / 100;
}

function celsiusToFahrenheit(value: number) {
  return value * (9 / 5) + 32;
}

function hydrometerCorrectionFactor(tempFahrenheit: number) {
  return (
    1.00130346 -
    0.000134722124 * tempFahrenheit +
    0.00000204052596 * Math.pow(tempFahrenheit, 2) -
    0.00000000232820948 * Math.pow(tempFahrenheit, 3)
  );
}

export function ogToPoints(og: number): number {
  if (!Number.isFinite(og) || og <= 0) {
    return 0;
  }

  return Math.max(0, (og - 1) * 1000);
}

export function pointsToOg(points: number): number {
  if (!Number.isFinite(points)) {
    return 1;
  }

  return 1 + clampPositive(points) / 1000;
}

export function calculateAbv(og: number, fg: number): number {
  if (!Number.isFinite(og) || !Number.isFinite(fg) || og <= 0 || fg <= 0) {
    return 0;
  }

  const raw = (og - fg) * 131.25;
  return Math.max(0, raw);
}

export function sgToPlato(sg: number): number {
  if (!Number.isFinite(sg) || sg <= 0) {
    return 0;
  }

  return (
    -616.868 +
    1111.14 * sg -
    630.272 * Math.pow(sg, 2) +
    135.997 * Math.pow(sg, 3)
  );
}

export function calculateBatchGravityPointsFromFermentables(
  fermentables: FermentableInput[],
  brewhouseEfficiencyPercent: number,
): number {
  const efficiency = toPercentFraction(brewhouseEfficiencyPercent);

  if (!efficiency) {
    return 0;
  }

  return fermentables.reduce((sum, fermentable) => {
    const weightKg = clampPositive(fermentable.weightKg);
    const ppg = clampPositive(fermentable.ppg);

    return sum + weightKg * ppg * efficiency;
  }, 0);
}

export function calculateOgFromFermentables(
  fermentables: FermentableInput[],
  volumeLiters: number,
  brewhouseEfficiencyPercent: number,
): number {
  const volume = clampPositive(volumeLiters);
  if (!volume) {
    return 1;
  }

  const normalizedPoints = calculateBatchGravityPointsFromFermentables(
    fermentables,
    brewhouseEfficiencyPercent,
  );
  const gravityPoints = (normalizedPoints * LITERS_REFERENCE_FOR_PPG) / volume;

  return pointsToOg(gravityPoints);
}

export function calculateRequiredMaltKgForTargetOg(
  targetOg: number,
  volumeLiters: number,
  brewhouseEfficiencyPercent: number,
  maltPpg: number,
): number {
  const volume = clampPositive(volumeLiters);
  const efficiency = toPercentFraction(brewhouseEfficiencyPercent);
  const ppg = clampPositive(maltPpg);
  const targetPoints = ogToPoints(targetOg);

  if (!volume || !efficiency || !ppg || !targetPoints) {
    return 0;
  }

  return (
    (targetPoints * volume) / (ppg * efficiency * LITERS_REFERENCE_FOR_PPG)
  );
}

export function calculateWeightedEfmPercent(
  fermentables: FermentableInput[],
): number {
  const totalWeightKg = fermentables.reduce(
    (sum, fermentable) => sum + clampPositive(fermentable.weightKg),
    0,
  );

  if (!totalWeightKg) {
    return 0;
  }

  const weightedTotal = fermentables.reduce((sum, fermentable) => {
    const weight = clampPositive(fermentable.weightKg);
    const efm = clampPositive(fermentable.efmPercent ?? 0);
    return sum + weight * efm;
  }, 0);

  return weightedTotal / totalWeightKg;
}

export function correctSgForTemperature(
  measuredSg: number,
  measuredTempCelsius: number,
  hydrometerCalibrationTempCelsius = HYDROMETER_CALIBRATION_C,
): number {
  if (!Number.isFinite(measuredSg) || measuredSg <= 0) {
    return 0;
  }

  if (
    !Number.isFinite(measuredTempCelsius) ||
    !Number.isFinite(hydrometerCalibrationTempCelsius)
  ) {
    return measuredSg;
  }

  const measuredFactor = hydrometerCorrectionFactor(
    celsiusToFahrenheit(measuredTempCelsius),
  );
  const calibrationFactor = hydrometerCorrectionFactor(
    celsiusToFahrenheit(hydrometerCalibrationTempCelsius),
  );

  if (!calibrationFactor) {
    return measuredSg;
  }

  return measuredSg * (measuredFactor / calibrationFactor);
}

export function platoToSg(plato: number): number {
  if (!Number.isFinite(plato)) {
    return 1;
  }

  return 1 + plato / (258.6 - (plato / 258.2) * 227.1);
}

export function litersToGallons(liters: number): number {
  return clampPositive(liters) / 3.78541;
}

export function gallonsToLiters(gallons: number): number {
  return clampPositive(gallons) * 3.78541;
}

export function calculateIbuTinseth(
  volumeLiters: number,
  boilGravitySg: number,
  additions: HopAddition[],
): number {
  if (
    !Number.isFinite(volumeLiters) ||
    volumeLiters <= 0 ||
    !Number.isFinite(boilGravitySg) ||
    boilGravitySg <= 0
  ) {
    return 0;
  }

  const totalIbu = additions.reduce((sum, addition) => {
    const weight = clampPositive(addition.weightGrams);
    const alpha = clampPositive(addition.alphaAcidPercent);
    const time = clampPositive(addition.boilTimeMinutes);

    if (!weight || !alpha || !time) {
      return sum;
    }

    const bignessFactor = 1.65 * Math.pow(0.000125, boilGravitySg - 1);
    const boilTimeFactor = (1 - Math.exp(-0.04 * time)) / 4.15;
    const utilization = bignessFactor * boilTimeFactor;

    const mgAlphaAcids = (alpha / 100) * weight * 1000;
    const ibu = (mgAlphaAcids * utilization) / volumeLiters;

    return sum + ibu;
  }, 0);

  return Math.max(0, totalIbu);
}

/**
 * Returns the Tinseth utilization factor for a given boil time and gravity.
 * utilization = bignessFactor × boilTimeFactor
 *   bignessFactor = 1.65 × 0.000125^(OG - 1)
 *   boilTimeFactor = (1 - e^(-0.04 × t)) / 4.15
 */
export function calculateTinsethUtilization(
  boilTimeMinutes: number,
  boilGravitySg: number,
): number {
  if (
    !Number.isFinite(boilTimeMinutes) ||
    boilTimeMinutes < 0 ||
    !Number.isFinite(boilGravitySg) ||
    boilGravitySg <= 0
  ) {
    return 0;
  }

  const bignessFactor = 1.65 * Math.pow(0.000125, boilGravitySg - 1);
  const boilTimeFactor = (1 - Math.exp(-0.04 * boilTimeMinutes)) / 4.15;
  return bignessFactor * boilTimeFactor;
}

/**
 * Returns the hop weight (grams) required to reach a target IBU.
 * Derived from Tinseth: weight_g = (targetIbu × volume) / ((alpha/100) × 1000 × utilization)
 */
export function calculateRequiredHopGramsForTargetIbu(
  targetIbu: number,
  volumeLiters: number,
  boilGravitySg: number,
  alphaAcidPercent: number,
  boilTimeMinutes: number,
): number {
  const volume = clampPositive(volumeLiters);
  const alpha = clampPositive(alphaAcidPercent);
  const ibu = clampPositive(targetIbu);

  if (!volume || !alpha || !ibu) {
    return 0;
  }

  const utilization = calculateTinsethUtilization(
    boilTimeMinutes,
    boilGravitySg,
  );
  if (!utilization) {
    return 0;
  }

  return (ibu * volume) / ((alpha / 100) * 1000 * utilization);
}

export function calculateMCU(
  malts: ColorMaltInput[],
  volumeLiters: number,
): number {
  const volume = clampPositive(volumeLiters);
  if (!volume) {
    return 0;
  }

  const volumeGallons = litersToGallons(volume);
  if (!volumeGallons) {
    return 0;
  }

  const totalMCU = malts.reduce((sum, malt) => {
    const weight = clampPositive(malt.weightKg);
    const lovibond = clampPositive(malt.lovibond);
    const weightPounds = weight * 2.2046226218;
    return sum + weightPounds * lovibond;
  }, 0);

  return totalMCU / volumeGallons;
}

export function mcuToSRM(mcu: number): number {
  if (!Number.isFinite(mcu) || mcu <= 0) {
    return 0;
  }

  // Morey equation: SRM = 1.4922 × MCU^0.6859
  return 1.4922 * Math.pow(mcu, 0.6859);
}

export function srmToEBC(srm: number): number {
  if (!Number.isFinite(srm) || srm <= 0) {
    return 0;
  }

  return srm * 1.97;
}

export function calculateSRMFromMalts(
  malts: ColorMaltInput[],
  volumeLiters: number,
): number {
  const mcu = calculateMCU(malts, volumeLiters);
  return mcuToSRM(mcu);
}

// ─── Water calculations ──────────────────────────────────────────────────────

export type WaterProfile = {
  ca: number; // Calcium (ppm)
  mg: number; // Magnesium (ppm)
  na: number; // Sodium (ppm)
  so4: number; // Sulfates (ppm)
  cl: number; // Chlorides (ppm)
  hco3: number; // Bicarbonates (ppm)
};

/**
 * Calculates Residual Alkalinity (RA) in ppm.
 * RA = HCO₃⁻ − (Ca²⁺ / 3.5 + Mg²⁺ / 7)
 * A high RA raises mash pH; a low RA lowers it.
 */
export function calculateResidualAlkalinity(
  hco3: number,
  ca: number,
  mg: number,
): number {
  if (!Number.isFinite(hco3) || !Number.isFinite(ca) || !Number.isFinite(mg)) {
    return 0;
  }

  const safeHco3 = clampPositive(hco3);
  const safeCa = clampPositive(ca);
  const safeMg = clampPositive(mg);

  return safeHco3 - (safeCa / 3.5 + safeMg / 7);
}

/**
 * Calculates the sulfate-to-chloride ratio.
 * High ratio (> 3) → drier, hop-forward profile.
 * Low ratio (< 1) → rounder, malt-forward profile.
 * Returns 0 when chloride is zero.
 */
export function calculateSulfateChlorideRatio(so4: number, cl: number): number {
  const safeSo4 = clampPositive(so4);
  const safeCl = clampPositive(cl);
  if (!safeCl) return 0;
  return safeSo4 / safeCl;
}

export function calculateRequiredMaltForTargetSRM(
  targetSRM: number,
  volumeLiters: number,
  maltLovibond: number,
): number {
  const volume = clampPositive(volumeLiters);
  const lovibond = clampPositive(maltLovibond);
  const srm = clampPositive(targetSRM);

  if (!volume || !lovibond || !srm) {
    return 0;
  }

  // Reverse Morey: MCU = (SRM / 1.4922)^(1/0.6859)
  const targetMCU = Math.pow(srm / 1.4922, 1 / 0.6859);
  const volumeGallons = litersToGallons(volume);

  if (!volumeGallons) {
    return 0;
  }

  // MCU = (weight_lbs * lovibond) / volume_gallons
  // weight_lbs = (MCU * volume_gallons) / lovibond
  const weightPounds = (targetMCU * volumeGallons) / lovibond;
  return weightPounds / 2.2046226218; // Convert to kg
}
