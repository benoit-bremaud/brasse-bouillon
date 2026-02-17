export type HopAddition = {
  weightGrams: number;
  alphaAcidPercent: number;
  boilTimeMinutes: number;
};

export type FermentableInput = {
  weightKg: number;
  ppg: number;
  efmPercent?: number;
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
