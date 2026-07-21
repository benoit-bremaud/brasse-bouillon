import { formatQuantity } from "@/core/utils/format";
import type { UnitSystem } from "@/core/preferences/account-preferences.types";

type Quantity = {
  amount: number;
  unit: string;
};

const IMPERIAL_CONVERSION_BY_METRIC_UNIT: Record<
  string,
  { factor: number; unit: string }
> = {
  kg: { factor: 2.2046226218, unit: "lb" },
  g: { factor: 0.0352739619, unit: "oz" },
  l: { factor: 0.2641720524, unit: "gal" },
  ml: { factor: 0.0338140227, unit: "fl oz" },
};

function normalizeMetricUnit(unit: string): string {
  if (unit === "l") {
    return "L";
  }

  if (unit === "ml") {
    return "mL";
  }

  return unit;
}

export function convertQuantity(
  amount: number,
  unit: string,
  unitSystem: UnitSystem,
): Quantity {
  if (!Number.isFinite(amount) || unitSystem === "metric") {
    return {
      amount: Number.isFinite(amount) ? amount : 0,
      unit: normalizeMetricUnit(unit),
    };
  }

  const conversion = IMPERIAL_CONVERSION_BY_METRIC_UNIT[unit];
  if (!conversion) {
    return { amount, unit };
  }

  return {
    amount: amount * conversion.factor,
    unit: conversion.unit,
  };
}

export function formatQuantityForUnitSystem(
  amount: number,
  unit: string,
  unitSystem: UnitSystem,
): string {
  const converted = convertQuantity(amount, unit, unitSystem);
  return formatQuantity(converted.amount, converted.unit);
}

export function formatVolumeForUnitSystem(
  liters: number,
  unitSystem: UnitSystem,
): string {
  return formatQuantityForUnitSystem(liters, "l", unitSystem);
}
