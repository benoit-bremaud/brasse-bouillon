export type HopAddition = {
  weightGrams: number;
  alphaAcidPercent: number;
  boilTimeMinutes: number;
};

function clampPositive(value: number) {
  if (!Number.isFinite(value) || value < 0) {
    return 0;
  }
  return value;
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

    const mgPerLiterAlpha = (alpha / 100) * weight * 1000;
    const ibu = (mgPerLiterAlpha * utilization) / volumeLiters;

    return sum + ibu;
  }, 0);

  return Math.max(0, totalIbu);
}
