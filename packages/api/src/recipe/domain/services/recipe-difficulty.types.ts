import { RecipeDifficultyLevel } from '../enums/recipe-difficulty-level.enum';
import { RecipeYeastType } from '../enums/recipe-yeast-type.enum';

/**
 * Framework-agnostic input for the difficulty computation. The caller (the
 * application service) maps the recipe + its sub-entities onto this shape; the
 * domain service stays pure and I/O-free. All fields are optional/nullable — a
 * null signal scores the most permissive tier (never punish a sparse recipe).
 *
 * See `docs/architecture/specs/recipe-difficulty-algorithm.md` (v1) and ADR-0024.
 */
export interface DifficultyInput {
  readonly ogTarget?: number | null;
  readonly abvEstimated?: number | null;
  readonly ebcTarget?: number | null;
  readonly yeast?: {
    readonly type: RecipeYeastType;
    readonly temperatureMaxC?: number | null;
  } | null;
  readonly water?: {
    readonly phTarget?: number | null;
    readonly calciumPpm?: number | null;
    readonly magnesiumPpm?: number | null;
    readonly sulfatePpm?: number | null;
    readonly chloridePpm?: number | null;
  } | null;
  /** Distinct fermentables (grain/extract) in the bill. */
  readonly distinctFermentables?: number;
  /** Distinct hop varieties (not timed additions). */
  readonly distinctHopVarieties?: number;
  /** Count of additives/adjuncts. */
  readonly additives?: number;
}

/** One stored explanation line — the tap-to-explain pedagogy (ADR-0024 D4). */
export interface DifficultyReason {
  readonly factor: string;
  readonly tier: number;
  readonly sentence: string;
}

export interface DifficultyResult {
  readonly computed: RecipeDifficultyLevel;
  readonly reasons: DifficultyReason[];
}
