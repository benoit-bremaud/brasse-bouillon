/**
 * Kinds of measurement a brewer records against a batch (#605).
 *
 * - `og` / `fg` — original / final specific gravity (one per batch, typically).
 * - `sg_spot` — a spot specific-gravity reading taken mid-fermentation.
 * - `temperature` — fermentation / mash temperature in °C.
 * - `ph` — wort / mash pH.
 */
export enum MeasurementType {
  OG = 'og',
  FG = 'fg',
  SG_SPOT = 'sg_spot',
  TEMPERATURE = 'temperature',
  PH = 'ph',
}

/** Specific-gravity-family types share the same plausible range + unitless reading. */
export const GRAVITY_MEASUREMENT_TYPES: readonly MeasurementType[] = [
  MeasurementType.OG,
  MeasurementType.FG,
  MeasurementType.SG_SPOT,
] as const;
