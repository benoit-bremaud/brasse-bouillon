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

export type DiastaticMaltInput = {
  weightKg: number;
  diastaticPowerWk: number;
};

export type PrimingSugarType = "dextrose" | "sucrose";

const LITERS_REFERENCE_FOR_PPG = 10;
const HYDROMETER_CALIBRATION_C = 20;
const DEXTROSE_PRIMING_FACTOR = 4.0;
const SUCROSE_PRIMING_FACTOR = 3.8;
const DEFAULT_CO2_SHRINKAGE_PERCENT = 4;

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

function toBoundedPercentFraction(value: number) {
  return Math.min(1, toPercentFraction(value));
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

// ─── Brewhouse efficiency / process yields ─────────────────────────────────

export function calculateBrewhouseEfficiencyPercent(
  actualOg: number,
  volumeLiters: number,
  fermentables: FermentableInput[],
): number {
  const volume = clampPositive(volumeLiters);
  const actualOgPoints = ogToPoints(actualOg);

  if (!volume || !actualOgPoints || fermentables.length === 0) {
    return 0;
  }

  const theoreticalPointsAt100Percent = fermentables.reduce(
    (sum, fermentable) =>
      sum +
      clampPositive(fermentable.weightKg) * clampPositive(fermentable.ppg),
    0,
  );

  if (!theoreticalPointsAt100Percent) {
    return 0;
  }

  const actualNormalizedPoints =
    (actualOgPoints * volume) / LITERS_REFERENCE_FOR_PPG;

  return (actualNormalizedPoints / theoreticalPointsAt100Percent) * 100;
}

export function calculateTargetPreBoilVolumeLiters(
  targetColdVolumeLiters: number,
  boilOffLiters: number,
  trubLossLiters: number,
  shrinkagePercent = DEFAULT_CO2_SHRINKAGE_PERCENT,
): number {
  const coldVolume = clampPositive(targetColdVolumeLiters);
  const boilOff = clampPositive(boilOffLiters);
  const trubLoss = clampPositive(trubLossLiters);
  const shrinkage = toBoundedPercentFraction(shrinkagePercent);
  const safeDivider = Math.max(0.01, 1 - shrinkage);

  if (!coldVolume) {
    return 0;
  }

  const hotPostBoilVolume = (coldVolume + trubLoss) / safeDivider;
  return hotPostBoilVolume + boilOff;
}

export type WaterPlanVolumes = {
  mashWaterLiters: number;
  spargeWaterLiters: number;
  preBoilVolumeLiters: number;
  totalWaterLiters: number;
};

export function calculateWaterPlanVolumes(
  totalGrainKg: number,
  mashRatioLitersPerKg: number,
  targetColdVolumeLiters: number,
  boilOffLiters: number,
  trubLossLiters: number,
  grainAbsorptionLitersPerKg = 0.8,
  shrinkagePercent = DEFAULT_CO2_SHRINKAGE_PERCENT,
): WaterPlanVolumes {
  const grainKg = clampPositive(totalGrainKg);
  const mashRatio = clampPositive(mashRatioLitersPerKg);
  const absorption = clampPositive(grainAbsorptionLitersPerKg);

  const mashWaterLiters = grainKg * mashRatio;
  const preBoilVolumeLiters = calculateTargetPreBoilVolumeLiters(
    targetColdVolumeLiters,
    boilOffLiters,
    trubLossLiters,
    shrinkagePercent,
  );
  const absorptionLossLiters = grainKg * absorption;
  const totalWaterLiters = preBoilVolumeLiters + absorptionLossLiters;
  const spargeWaterLiters = Math.max(0, totalWaterLiters - mashWaterLiters);

  return {
    mashWaterLiters,
    spargeWaterLiters,
    preBoilVolumeLiters,
    totalWaterLiters,
  };
}

// ─── Yeast / fermentation planning ──────────────────────────────────────────

export const ALE_PITCH_RATE_M_PER_ML_PLATO = 0.75;
export const LAGER_PITCH_RATE_M_PER_ML_PLATO = 1.5;

export function calculateRequiredYeastCellsBillions(
  og: number,
  volumeLiters: number,
  pitchRateMillionCellsPerMlPlato = ALE_PITCH_RATE_M_PER_ML_PLATO,
): number {
  const plato = clampPositive(sgToPlato(og));
  const volumeMl = clampPositive(volumeLiters) * 1000;
  const pitchRate = clampPositive(pitchRateMillionCellsPerMlPlato);

  if (!plato || !volumeMl || !pitchRate) {
    return 0;
  }

  const requiredMillionCells = pitchRate * plato * volumeMl;
  return requiredMillionCells / 1000;
}

export function calculateEstimatedFgFromAttenuation(
  og: number,
  attenuationPercent: number,
): number {
  if (!Number.isFinite(og) || og <= 0) {
    return 1;
  }

  const attenuation = toBoundedPercentFraction(attenuationPercent);
  const fg = og - (og - 1) * attenuation;

  return Math.max(1, fg);
}

export function calculateDryYeastPacketsNeeded(
  requiredCellsBillions: number,
  cellsPerPacketBillions = 200,
  viabilityPercent = 100,
): number {
  const requiredCells = clampPositive(requiredCellsBillions);
  const cellsPerPacket = clampPositive(cellsPerPacketBillions);
  const viability = toBoundedPercentFraction(viabilityPercent);

  if (!requiredCells || !cellsPerPacket || !viability) {
    return 0;
  }

  return requiredCells / (cellsPerPacket * viability);
}

// ─── Carbonation / packaging ────────────────────────────────────────────────

export function estimateResidualCo2Volumes(
  beerTemperatureCelsius: number,
): number {
  if (!Number.isFinite(beerTemperatureCelsius)) {
    return 0;
  }

  const tempF = celsiusToFahrenheit(beerTemperatureCelsius);
  const volumes = 3.0378 - 0.050062 * tempF + 0.00026555 * Math.pow(tempF, 2);

  return Math.max(0, volumes);
}

export function calculatePrimingSugarGrams(
  targetCo2Volumes: number,
  batchVolumeLiters: number,
  beerTemperatureCelsius: number,
  sugarType: PrimingSugarType = "dextrose",
): number {
  const target = clampPositive(targetCo2Volumes);
  const volume = clampPositive(batchVolumeLiters);

  if (!target || !volume) {
    return 0;
  }

  const residual = estimateResidualCo2Volumes(beerTemperatureCelsius);
  const additionalVolumes = Math.max(0, target - residual);
  const sugarFactor =
    sugarType === "sucrose" ? SUCROSE_PRIMING_FACTOR : DEXTROSE_PRIMING_FACTOR;

  return additionalVolumes * volume * sugarFactor;
}

/**
 * Empirical pressure estimation for force carbonation in kegs.
 * Formula uses temperature in °F and target CO₂ in volumes.
 */
export function calculateKegPressurePsiForTargetCo2(
  targetCo2Volumes: number,
  beerTemperatureCelsius: number,
): number {
  const target = clampPositive(targetCo2Volumes);

  if (!target || !Number.isFinite(beerTemperatureCelsius)) {
    return 0;
  }

  const tempF = celsiusToFahrenheit(beerTemperatureCelsius);

  const psi =
    -16.6999 -
    0.0101059 * tempF +
    0.00116512 * Math.pow(tempF, 2) +
    0.173354 * tempF * target +
    4.24267 * target -
    0.0684226 * Math.pow(target, 2);

  return Math.max(0, psi);
}

// ─── Advanced diagnostics ───────────────────────────────────────────────────

export function calculateTotalDiastaticPowerWk(
  malts: DiastaticMaltInput[],
): number {
  return malts.reduce(
    (sum, malt) =>
      sum + clampPositive(malt.weightKg) * clampPositive(malt.diastaticPowerWk),
    0,
  );
}

export function calculateAverageDiastaticPowerWkPerKg(
  malts: DiastaticMaltInput[],
): number {
  const totalWeight = malts.reduce(
    (sum, malt) => sum + clampPositive(malt.weightKg),
    0,
  );

  if (!totalWeight) {
    return 0;
  }

  return calculateTotalDiastaticPowerWk(malts) / totalWeight;
}

export function calculateKolbachIndexPercent(
  solubleNitrogenPercent: number,
  totalNitrogenPercent: number,
): number {
  const soluble = clampPositive(solubleNitrogenPercent);
  const total = clampPositive(totalNitrogenPercent);

  if (!soluble || !total) {
    return 0;
  }

  return (soluble / total) * 100;
}

export function estimateMashViscosityCp(betaGlucansMgPerL: number): number {
  const betaGlucans = clampPositive(betaGlucansMgPerL);
  return 1.2 + 0.015 * betaGlucans;
}

export function estimateFanFromKolbachAndOg(
  kolbachPercent: number,
  og: number,
): number {
  const kolbach = clampPositive(kolbachPercent);
  const ogPoints = clampPositive(ogToPoints(og));

  if (!kolbach || !ogPoints) {
    return 0;
  }

  return 0.2 * kolbach * ogPoints;
}

export function estimateBoilingPointAtAltitudeC(
  altitudeMeters: number,
): number {
  const altitude = clampPositive(altitudeMeters);
  return Math.max(0, 100 - altitude / 300);
}

export function estimateAtmosphericPressureHpa(altitudeMeters: number): number {
  const altitude = clampPositive(altitudeMeters);
  return Math.max(0, 1013 - altitude / 8.5);
}

/**
 * Practical correction factor for IBU targets in altitude.
 * Around +12.5% at 1500m, capped to +30%.
 */
export function calculateAltitudeIbuCorrectionFactor(
  altitudeMeters: number,
): number {
  const altitude = clampPositive(altitudeMeters);
  const normalizedGain = (altitude / 1500) * 0.125;
  return 1 + Math.min(0.3, normalizedGain);
}

export function calculateAltitudeAdjustedIbuTarget(
  targetIbuAtSeaLevel: number,
  altitudeMeters: number,
): number {
  const target = clampPositive(targetIbuAtSeaLevel);
  if (!target) {
    return 0;
  }

  return target * calculateAltitudeIbuCorrectionFactor(altitudeMeters);
}
