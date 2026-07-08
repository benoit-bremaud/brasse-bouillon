import {
  FermenterReason,
  FermenterVerdict,
  KettleReason,
  KettleVerdict,
} from './enums/capacity-verdict.enum';

/**
 * Inputs to the capacity fit-check (ADR-0026), already read from the recipe,
 * its optional `recipe_water` row, and the caller's equipment profile.
 */
export interface CapacityFitInput {
  /** Recipe target volume (`batch_size_l`); nullable — user recipes omit it. */
  readonly batchSizeL: number | null;
  /** Mash + sparge water, from the OPTIONAL `recipe_water` 1:1 (null if absent). */
  readonly recipeWater: {
    readonly mashVolumeL: number;
    readonly spargeVolumeL: number;
  } | null;
  /** The resolved equipment profile capacities (null when none is declared). */
  readonly profile: {
    readonly fermenterVolumeL: number;
    readonly boilKettleVolumeL: number;
  } | null;
  /** Headspace fraction reserved on the fermenter (see `HEADSPACE_RATIO`). */
  readonly headspaceRatio: number;
}

/**
 * The advisory capacity fit result (ADR-0026). Numeric fields are populated
 * **only** when the corresponding leg's verdict is evaluated — `null` otherwise
 * (never a fabricated `0`/`NaN`). A `NOT_EVALUATED` verdict carries a `reason`.
 */
export interface CapacityFit {
  readonly fermenter: FermenterVerdict;
  readonly fermenterReason: FermenterReason | null;
  readonly kettle: KettleVerdict;
  readonly kettleReason: KettleReason | null;
  readonly fermenterUsableL: number | null;
  readonly recipeVolumeL: number | null;
  readonly preBoilL: number | null;
  readonly kettleCapacityL: number | null;
  readonly scaleRatio: number | null;
}

/** A finite, strictly-positive number — the only shape every leg can evaluate. */
function isPositiveFinite(value: number | null | undefined): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0;
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

interface FermenterLeg {
  readonly fermenter: FermenterVerdict;
  readonly fermenterReason: FermenterReason | null;
  readonly fermenterUsableL: number | null;
  readonly recipeVolumeL: number | null;
  readonly scaleRatio: number | null;
}

function evaluateFermenter(
  batchSizeL: number | null,
  fermenterVolumeL: number,
  headspaceRatio: number,
): FermenterLeg {
  const notEvaluated = (reason: FermenterReason): FermenterLeg => ({
    fermenter: FermenterVerdict.NOT_EVALUATED,
    fermenterReason: reason,
    fermenterUsableL: null,
    recipeVolumeL: null,
    scaleRatio: null,
  });

  if (!isPositiveFinite(batchSizeL)) {
    return notEvaluated(FermenterReason.NO_RECIPE_VOLUME);
  }
  if (!isPositiveFinite(fermenterVolumeL)) {
    return notEvaluated(FermenterReason.NO_FERMENTER_VOLUME);
  }

  const usableL = fermenterVolumeL * (1 - headspaceRatio);
  // Guard the derived usable volume, not just the raw capacity: a degenerate
  // headspaceRatio (NaN, negative, or >= 1) would make `usableL` NaN/<= 0 and
  // fabricate a TOO_LARGE with a NaN/Infinity scale ratio. In v1 headspaceRatio
  // is the fixed 0.10 constant, but this keeps the pure function's "never
  // fabricates a verdict / never divides by zero" contract caller-agnostic.
  if (!isPositiveFinite(usableL)) {
    return notEvaluated(FermenterReason.NO_FERMENTER_VOLUME);
  }
  const fits = batchSizeL <= usableL;
  return {
    fermenter: fits ? FermenterVerdict.FITS : FermenterVerdict.TOO_LARGE,
    fermenterReason: null,
    fermenterUsableL: round2(usableL),
    recipeVolumeL: round2(batchSizeL),
    scaleRatio: fits ? null : round2(batchSizeL / usableL),
  };
}

interface KettleLeg {
  readonly kettle: KettleVerdict;
  readonly kettleReason: KettleReason | null;
  readonly preBoilL: number | null;
  readonly kettleCapacityL: number | null;
}

function evaluateKettle(
  recipeWater: CapacityFitInput['recipeWater'],
  boilKettleVolumeL: number,
): KettleLeg {
  const notEvaluated = (reason: KettleReason): KettleLeg => ({
    kettle: KettleVerdict.NOT_EVALUATED,
    kettleReason: reason,
    preBoilL: null,
    kettleCapacityL: null,
  });

  if (recipeWater === null) {
    return notEvaluated(KettleReason.NO_RECIPE_WATER);
  }
  const preBoilL = recipeWater.mashVolumeL + recipeWater.spargeVolumeL;
  if (!isPositiveFinite(preBoilL)) {
    // A present-but-empty water row yields no usable pre-boil.
    return notEvaluated(KettleReason.NO_RECIPE_WATER);
  }
  if (!isPositiveFinite(boilKettleVolumeL)) {
    return notEvaluated(KettleReason.NO_KETTLE_VOLUME);
  }

  // Approximate pre-boil (method logic deferred, ADR-0020 D2): a non-blocking
  // WARNING only — never HARD_STOP in v1.
  const ok = preBoilL <= boilKettleVolumeL;
  return {
    kettle: ok ? KettleVerdict.OK : KettleVerdict.WARNING,
    kettleReason: null,
    preBoilL: round2(preBoilL),
    kettleCapacityL: round2(boilKettleVolumeL),
  };
}

/**
 * Compute the advisory equipment capacity fit (ADR-0026) — a pure function.
 *
 * Never throws, never blocks, never fabricates a verdict: any missing or
 * degenerate input yields `NOT_EVALUATED` for its own leg, tagged with a
 * `reason`. When no profile is declared, both legs are `NOT_EVALUATED` with
 * `NO_PROFILE` (the client shows the "declare your equipment" call-to-action).
 */
export function computeCapacityFit(input: CapacityFitInput): CapacityFit {
  const { batchSizeL, recipeWater, profile, headspaceRatio } = input;

  if (profile === null) {
    return {
      fermenter: FermenterVerdict.NOT_EVALUATED,
      fermenterReason: FermenterReason.NO_PROFILE,
      kettle: KettleVerdict.NOT_EVALUATED,
      kettleReason: KettleReason.NO_PROFILE,
      fermenterUsableL: null,
      recipeVolumeL: null,
      preBoilL: null,
      kettleCapacityL: null,
      scaleRatio: null,
    };
  }

  const fermenter = evaluateFermenter(
    batchSizeL,
    profile.fermenterVolumeL,
    headspaceRatio,
  );
  const kettle = evaluateKettle(recipeWater, profile.boilKettleVolumeL);

  return { ...fermenter, ...kettle };
}
