import { Repository } from 'typeorm';

import { BatchOrmEntity } from '../../batch/entities/batch.orm.entity';
import { BatchStatus } from '../../batch/domain/enums/batch-status.enum';
import { BatchStepOrmEntity } from '../../batch/entities/batch-step.orm.entity';
import { BatchStepStatus } from '../../batch/domain/enums/batch-step-status.enum';
import { RecipeOrmEntity } from '../../recipe/entities/recipe.orm.entity';
import { RecipeStepType } from '../../recipe/domain/enums/recipe-step-type.enum';
import { SYSTEM_USER_ID } from './system-user.seed';
import { idempotentUpsertById } from './seed-utils';

/**
 * Seed for `batches` table — pre-populated demo brassin (Issue #782,
 * minimal+ version).
 *
 * Pre-seeds a `Batch` row tied to the curated Punk IPA public recipe
 * (seeded by `seedPublicRecipes`, ID `00000000-0000-4000-8000-000000000001`)
 * so the demo flow tells a complete story end-to-end:
 *   1. j'ai scanné Punk IPA   (PR #768 + scan flow shipped)
 *   2. j'ai importé la recette (PR #743 community import)
 *   3. j'ai brassé             (THIS SEED — visible under Mes Brassins)
 *
 * The brassin is left in `COMPLETED` state with `started_at` ~14
 * days ago and `completed_at` ~7 days ago, computed relative to seed
 * runtime so the dates always feel fresh on stage. Owner is the
 * `SYSTEM_USER` sentinel — no real user account is touched.
 *
 * This is the **minimal+** scope of #782. Measurements, observations,
 * step transitions, volumes, OG/FG/ABV are all deferred to the
 * larger #605 data model rewrite — those columns do not exist yet on
 * the `batches` table. The current seed only populates what fits the
 * existing schema + the two narrative columns added by migration
 * `AddBatchDemoNarrativeFields1782000000000`.
 *
 * Idempotent: re-running updates the row in place rather than
 * inserting duplicates. Keyed by the deterministic UUID below.
 */

/**
 * Deterministic UUID for the demo brassin. Picked from the
 * `00000000-0000-4000-8000-…` range used by curated public recipes,
 * suffix `b1` → "brassin one".
 */
export const DEMO_PUNK_IPA_BATCH_ID = '00000000-0000-4000-8000-0000000000b1';

/**
 * Recipe ID the demo brassin is linked to. Matches the Punk IPA
 * entry seeded by `seedPublicRecipes`.
 */
export const DEMO_PUNK_IPA_RECIPE_ID = '00000000-0000-4000-8000-000000000001';

/**
 * Days-ago anchor. The demo brassin started 14 days before the seed
 * runs and completed 7 days before the seed runs (so the brassin is
 * "fresh" but unambiguously in the past). Recomputed at every seed
 * run to keep the timeline plausible whatever the calendar date.
 */
const DAYS_SINCE_STARTED = 14;
const DAYS_SINCE_COMPLETED = 7;

const ONE_DAY_MS = 24 * 60 * 60 * 1000;
const ONE_HOUR_MS = 60 * 60 * 1000;

function daysAgo(days: number, now: Date = new Date()): Date {
  return new Date(now.getTime() - days * ONE_DAY_MS);
}

/**
 * The 7 brewing-day steps of the Punk IPA demo brassin. Uses the
 * existing 5-type RecipeStepType enum (MASH/BOIL/WHIRLPOOL/
 * FERMENTATION/PACKAGING); the FERMENTATION type appears 3 times
 * with distinct labels because the BJCP-style brewing flow has
 * three distinct fermentation phases worth surfacing on the
 * brassin timeline (primary, dry hop, conditioning).
 *
 * Time anchors are relative offsets from the parent Batch dates,
 * computed at seed time. Brewing day (mash → whirlpool) lives on
 * day 1 across ~4 hours; fermentation phases stretch over the
 * 14-day window between started_at and completed_at.
 */
interface DemoStepTemplate {
  step_order: number;
  type: RecipeStepType;
  label: string;
  description: string;
  /** Offset in milliseconds from `Batch.started_at`. */
  startOffsetMs: number;
  /** Offset in milliseconds from `Batch.started_at`. */
  endOffsetMs: number;
}

const DEMO_STEPS: readonly DemoStepTemplate[] = [
  {
    step_order: 1,
    type: RecipeStepType.MASH,
    label: 'Empâtage',
    description:
      'Mash 60 min à 67°C dans 30 L (rapport 3 L/kg). Iode test négatif à 60 min.',
    startOffsetMs: 9 * ONE_HOUR_MS,
    endOffsetMs: 10 * ONE_HOUR_MS,
  },
  {
    step_order: 2,
    type: RecipeStepType.BOIL,
    label: 'Ébullition + houblonnage',
    description:
      'Boil 60 min, Magnum à T-60min (amertume), Citra à T-15min, Mosaic flameout.',
    startOffsetMs: 10 * ONE_HOUR_MS,
    endOffsetMs: 11 * ONE_HOUR_MS,
  },
  {
    step_order: 3,
    type: RecipeStepType.WHIRLPOOL,
    label: 'Whirlpool + refroidissement',
    description:
      'Whirlpool 20 min puis refroidissement à 19°C via plate chiller.',
    startOffsetMs: 11 * ONE_HOUR_MS,
    endOffsetMs: 12 * ONE_HOUR_MS,
  },
  {
    step_order: 4,
    type: RecipeStepType.FERMENTATION,
    label: 'Fermentation primaire',
    description:
      'Pitch SafAle US-05 réhydratée. Primary 7 jours à 19°C. Krausen massif jour 2-3.',
    startOffsetMs: 12 * ONE_HOUR_MS,
    endOffsetMs: 7 * ONE_DAY_MS,
  },
  {
    step_order: 5,
    type: RecipeStepType.FERMENTATION,
    label: 'Dry hop',
    description: 'Dry hop Citra + Mosaic 3 jours, températures stables 19°C.',
    startOffsetMs: 7 * ONE_DAY_MS,
    endOffsetMs: 10 * ONE_DAY_MS,
  },
  {
    step_order: 6,
    type: RecipeStepType.FERMENTATION,
    label: 'Conditionnement',
    description:
      'Garde 4 jours à 4°C pour clarification et sédimentation des houblons.',
    startOffsetMs: 10 * ONE_DAY_MS,
    endOffsetMs: 14 * ONE_DAY_MS,
  },
  {
    step_order: 7,
    type: RecipeStepType.PACKAGING,
    label: 'Mise en bouteille',
    description:
      'Embouteillage avec sucre de refermentation 7g/L. 18 L finaux.',
    startOffsetMs: 14 * ONE_DAY_MS,
    endOffsetMs: 14 * ONE_DAY_MS + ONE_HOUR_MS,
  },
];

/**
 * Result returned by `seedDemoBatch` for instrumentation. Lets
 * callers (CLI, tests) report what happened without re-querying.
 */
export interface SeedDemoBatchResult {
  /** 0 or 1 — the batch row was inserted as new. */
  insertedBatch: number;
  /** 0 or 1 — the batch row already existed and was updated in place. */
  updatedBatch: number;
  /** Number of step rows inserted (subset of 7). */
  insertedSteps: number;
  /** Number of step rows updated in place. */
  updatedSteps: number;
}

/**
 * Reason a seed run can skip rather than insert/update — typically
 * the linked recipe row is missing because `seedPublicRecipes` has
 * not run yet.
 */
export class DemoBatchPrerequisiteMissingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DemoBatchPrerequisiteMissingError';
  }
}

/**
 * Idempotent loader. Looks up the Punk IPA recipe by ID; if absent,
 * throws `DemoBatchPrerequisiteMissingError` so the caller knows to
 * run `seedPublicRecipes` first. Otherwise inserts (or updates in
 * place) the demo brassin row + the 7 brewing-day steps.
 *
 * The narrative copy is in French because it is surfaced verbatim
 * to the user on the mobile UI. All other code in this file stays
 * in English per project convention.
 *
 * Step seeding follows the same idempotency contract as the batch
 * row itself: existing rows (matched by composite PK
 * batch_id + step_order) are updated in place; missing rows are
 * inserted. Re-running the seed never duplicates.
 */
export async function seedDemoBatch(
  batchRepository: Repository<BatchOrmEntity>,
  recipeRepository: Repository<RecipeOrmEntity>,
  stepRepository: Repository<BatchStepOrmEntity>,
  now: Date = new Date(),
): Promise<SeedDemoBatchResult> {
  const recipe = await recipeRepository.findOne({
    where: { id: DEMO_PUNK_IPA_RECIPE_ID },
  });

  if (!recipe) {
    throw new DemoBatchPrerequisiteMissingError(
      `Cannot seed demo batch — Punk IPA recipe ${DEMO_PUNK_IPA_RECIPE_ID} ` +
        `is not in the recipes table. Run seedPublicRecipes first.`,
    );
  }

  const startedAt = daysAgo(DAYS_SINCE_STARTED, now);
  const completedAt = daysAgo(DAYS_SINCE_COMPLETED, now);

  const batchPayload = {
    owner_id: SYSTEM_USER_ID,
    recipe_id: DEMO_PUNK_IPA_RECIPE_ID,
    name: 'Mon premier Punk IPA',
    status: BatchStatus.COMPLETED,
    current_step_order: null,
    started_at: startedAt,
    fermentation_started_at: startedAt,
    fermentation_completed_at: completedAt,
    completed_at: completedAt,
    target_volume_l: 20,
    final_volume_l: 18,
    og_actual: 1.057,
    fg_actual: 1.013,
    abv_actual: 5.8,
    notes:
      'Première Punk IPA brassée à la maison, inspirée par la fiche ' +
      'BrewDog DIY Dog. Le krausen a été massif au jour 3, le dry hop ' +
      'Citra + Mosaic a donné un nez tropical superbe. Sec et houblonné ' +
      'à souhait — équilibre amertume/fruité tropical réussi.',
  };

  const batchOutcome = await idempotentUpsertById(
    batchRepository,
    { id: DEMO_PUNK_IPA_BATCH_ID },
    batchPayload,
  );

  let insertedSteps = 0;
  let updatedSteps = 0;

  for (const template of DEMO_STEPS) {
    const stepStartedAt = new Date(
      startedAt.getTime() + template.startOffsetMs,
    );
    const stepCompletedAt = new Date(
      startedAt.getTime() + template.endOffsetMs,
    );

    const stepOutcome = await idempotentUpsertById(
      stepRepository,
      {
        batch_id: DEMO_PUNK_IPA_BATCH_ID,
        step_order: template.step_order,
      },
      {
        type: template.type,
        label: template.label,
        description: template.description,
        status: BatchStepStatus.COMPLETED,
        started_at: stepStartedAt,
        completed_at: stepCompletedAt,
      },
    );
    insertedSteps += stepOutcome.inserted;
    updatedSteps += stepOutcome.updated;
  }

  return {
    insertedBatch: batchOutcome.inserted,
    updatedBatch: batchOutcome.updated,
    insertedSteps,
    updatedSteps,
  };
}
