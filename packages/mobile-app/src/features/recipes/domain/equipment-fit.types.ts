/**
 * Advisory equipment capacity fit-check (ADR-0026) — mobile domain types,
 * mirroring the backend `CapacityFitDto` from `GET /recipes/:id/equipment-fit`.
 * Numeric fields are null when the corresponding leg is `NOT_EVALUATED`.
 */

export type FermenterVerdict = "FITS" | "TOO_LARGE" | "NOT_EVALUATED";

export type KettleVerdict = "OK" | "WARNING" | "HARD_STOP" | "NOT_EVALUATED";

export type FermenterReason =
  | "NO_PROFILE"
  | "NO_RECIPE_VOLUME"
  | "NO_FERMENTER_VOLUME";

export type KettleReason =
  | "NO_PROFILE"
  | "NO_RECIPE_WATER"
  | "NO_KETTLE_VOLUME";

export interface CapacityFit {
  fermenter: FermenterVerdict;
  fermenterReason: FermenterReason | null;
  kettle: KettleVerdict;
  kettleReason: KettleReason | null;
  fermenterUsableL: number | null;
  recipeVolumeL: number | null;
  preBoilL: number | null;
  kettleCapacityL: number | null;
  scaleRatio: number | null;
}
