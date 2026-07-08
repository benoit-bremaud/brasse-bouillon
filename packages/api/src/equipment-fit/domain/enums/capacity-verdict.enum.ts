/**
 * Verdicts and reasons for the equipment capacity fit-check (ADR-0026).
 *
 * The fit-check is advisory — it never blocks the launch in v1. Each leg
 * (fermenter, kettle) carries its own verdict, and a `NOT_EVALUATED` verdict
 * carries a `reason` so the client renders the right advisory without inferring
 * intent from absent numbers.
 */

/** Fermenter leg verdict. `TOO_LARGE` is advisory (surfaces a scale ratio). */
export enum FermenterVerdict {
  FITS = 'FITS',
  TOO_LARGE = 'TOO_LARGE',
  NOT_EVALUATED = 'NOT_EVALUATED',
}

/**
 * Kettle leg verdict. `WARNING` is non-blocking in v1; `HARD_STOP` is modelled
 * but not emitted until the ADR-0020 D2 method logic makes "physically
 * impossible" reliable.
 */
export enum KettleVerdict {
  OK = 'OK',
  WARNING = 'WARNING',
  HARD_STOP = 'HARD_STOP',
  NOT_EVALUATED = 'NOT_EVALUATED',
}

/** Why the fermenter leg could not be evaluated (set only when `NOT_EVALUATED`). */
export enum FermenterReason {
  NO_PROFILE = 'NO_PROFILE',
  NO_RECIPE_VOLUME = 'NO_RECIPE_VOLUME',
  NO_FERMENTER_VOLUME = 'NO_FERMENTER_VOLUME',
}

/** Why the kettle leg could not be evaluated (set only when `NOT_EVALUATED`). */
export enum KettleReason {
  NO_PROFILE = 'NO_PROFILE',
  NO_RECIPE_WATER = 'NO_RECIPE_WATER',
  NO_KETTLE_VOLUME = 'NO_KETTLE_VOLUME',
}
