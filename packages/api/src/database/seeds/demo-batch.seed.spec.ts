import { Repository } from 'typeorm';

import { BatchOrmEntity } from '../../batch/entities/batch.orm.entity';
import { BatchStatus } from '../../batch/domain/enums/batch-status.enum';
import { BatchStepOrmEntity } from '../../batch/entities/batch-step.orm.entity';
import { BatchStepStatus } from '../../batch/domain/enums/batch-step-status.enum';
import { RecipeOrmEntity } from '../../recipe/entities/recipe.orm.entity';
import { RecipeStepType } from '../../recipe/domain/enums/recipe-step-type.enum';
import {
  DEMO_PUNK_IPA_BATCH_ID,
  DEMO_PUNK_IPA_RECIPE_ID,
  DemoBatchPrerequisiteMissingError,
  seedDemoBatch,
} from './demo-batch.seed';
import { buildRepoMock } from './seed-test-utils';
import { SYSTEM_USER_ID } from './system-user.seed';

const FAKE_NOW = new Date('2026-04-30T12:00:00.000Z');

describe('seedDemoBatch (Issue #782)', () => {
  describe('sad path — prerequisite recipe missing', () => {
    it('throws DemoBatchPrerequisiteMissingError when the Punk IPA recipe is not in the recipes table', async () => {
      const batchRepo = buildRepoMock();
      const recipeRepo = buildRepoMock();
      const stepRepo = buildRepoMock();
      recipeRepo.findOne.mockResolvedValueOnce(null);

      await expect(
        seedDemoBatch(
          batchRepo as unknown as Repository<BatchOrmEntity>,
          recipeRepo as unknown as Repository<RecipeOrmEntity>,
          stepRepo as unknown as Repository<BatchStepOrmEntity>,
          FAKE_NOW,
        ),
      ).rejects.toBeInstanceOf(DemoBatchPrerequisiteMissingError);

      // No batch or step writes happened.
      expect(batchRepo.create).not.toHaveBeenCalled();
      expect(batchRepo.save).not.toHaveBeenCalled();
      expect(stepRepo.create).not.toHaveBeenCalled();
      expect(stepRepo.save).not.toHaveBeenCalled();
    });
  });

  describe('happy path — recipe exists, neither batch nor steps exist', () => {
    let batchRepo: ReturnType<typeof buildRepoMock>;
    let recipeRepo: ReturnType<typeof buildRepoMock>;
    let stepRepo: ReturnType<typeof buildRepoMock>;

    beforeEach(async () => {
      batchRepo = buildRepoMock();
      recipeRepo = buildRepoMock();
      stepRepo = buildRepoMock();
      recipeRepo.findOne.mockResolvedValueOnce({
        id: DEMO_PUNK_IPA_RECIPE_ID,
      });
      batchRepo.findOne.mockResolvedValueOnce(null);
      stepRepo.findOne.mockResolvedValue(null);

      await seedDemoBatch(
        batchRepo as unknown as Repository<BatchOrmEntity>,
        recipeRepo as unknown as Repository<RecipeOrmEntity>,
        stepRepo as unknown as Repository<BatchStepOrmEntity>,
        FAKE_NOW,
      );
    });

    it('inserts the batch row with the demo narrative + metric payload', () => {
      expect(batchRepo.create).toHaveBeenCalledTimes(1);
      const created = (
        batchRepo.create.mock.calls[0] as unknown[]
      )[0] as Record<string, unknown>;
      expect(created.id).toBe(DEMO_PUNK_IPA_BATCH_ID);
      expect(created.owner_id).toBe(SYSTEM_USER_ID);
      expect(created.recipe_id).toBe(DEMO_PUNK_IPA_RECIPE_ID);
      expect(created.name).toBe('Mon premier Punk IPA');
      expect(created.status).toBe(BatchStatus.COMPLETED);
      expect(created.target_volume_l).toBe(20);
      expect(created.final_volume_l).toBe(18);
      expect(created.og_actual).toBe(1.057);
      expect(created.fg_actual).toBe(1.013);
      expect(created.abv_actual).toBe(5.8);
      expect(created.notes).toMatch(/Première Punk IPA/i);
    });

    it('seeds 7 BatchStep rows all marked COMPLETED', () => {
      expect(stepRepo.create).toHaveBeenCalledTimes(7);
      for (const call of stepRepo.create.mock.calls as unknown[][]) {
        const arg = call[0] as Record<string, unknown>;
        expect(arg.batch_id).toBe(DEMO_PUNK_IPA_BATCH_ID);
        expect(arg.status).toBe(BatchStepStatus.COMPLETED);
        expect(arg.label).toEqual(expect.any(String));
        expect(arg.description).toEqual(expect.any(String));
      }
    });

    it('orders steps from 1 to 7 and uses only canonical RecipeStepType values', () => {
      const orders = (stepRepo.create.mock.calls as unknown[][]).map(
        (call) => (call[0] as Record<string, unknown>).step_order,
      );
      expect(orders).toEqual([1, 2, 3, 4, 5, 6, 7]);

      const types = (stepRepo.create.mock.calls as unknown[][]).map(
        (call) => (call[0] as Record<string, unknown>).type,
      );
      const validTypes = Object.values(RecipeStepType);
      for (const t of types) {
        expect(validTypes).toContain(t);
      }
    });

    it('reports inserted=1, no updates, 7 inserted steps', async () => {
      const result = await seedDemoBatch(
        buildRepoMock() as unknown as Repository<BatchOrmEntity>,
        ((): RepoMock => {
          const repo = buildRepoMock();
          repo.findOne.mockResolvedValueOnce({ id: DEMO_PUNK_IPA_RECIPE_ID });
          return repo;
        })() as unknown as Repository<RecipeOrmEntity>,
        ((): RepoMock => {
          const repo = buildRepoMock();
          repo.findOne.mockResolvedValue(null);
          return repo;
        })() as unknown as Repository<BatchStepOrmEntity>,
        FAKE_NOW,
      );
      // The batch repo above has no findOne mock returning an existing row,
      // so the loader sees null and inserts.
      expect(result).toEqual({
        insertedBatch: 1,
        updatedBatch: 0,
        insertedSteps: 7,
        updatedSteps: 0,
      });
    });
  });

  describe('idempotency — re-running updates instead of inserting', () => {
    it('updates the existing batch row + 7 steps in place when re-run', async () => {
      const batchRepo = buildRepoMock();
      const recipeRepo = buildRepoMock();
      const stepRepo = buildRepoMock();

      recipeRepo.findOne.mockResolvedValueOnce({
        id: DEMO_PUNK_IPA_RECIPE_ID,
      });
      // Existing batch + 7 existing steps (re-run scenario).
      batchRepo.findOne.mockResolvedValueOnce({
        id: DEMO_PUNK_IPA_BATCH_ID,
        // Older stale values that the seed should overwrite.
        name: 'Stale name',
        status: BatchStatus.IN_PROGRESS,
      });
      stepRepo.findOne.mockResolvedValue({
        batch_id: DEMO_PUNK_IPA_BATCH_ID,
        step_order: 1,
        status: BatchStepStatus.IN_PROGRESS,
      });

      const result = await seedDemoBatch(
        batchRepo as unknown as Repository<BatchOrmEntity>,
        recipeRepo as unknown as Repository<RecipeOrmEntity>,
        stepRepo as unknown as Repository<BatchStepOrmEntity>,
        FAKE_NOW,
      );

      expect(result).toEqual({
        insertedBatch: 0,
        updatedBatch: 1,
        insertedSteps: 0,
        updatedSteps: 7,
      });
      // No `create` calls since we're updating in place.
      expect(batchRepo.create).not.toHaveBeenCalled();
      expect(stepRepo.create).not.toHaveBeenCalled();
      // The save calls write the refreshed payload.
      expect(batchRepo.save).toHaveBeenCalledTimes(1);
      expect(stepRepo.save).toHaveBeenCalledTimes(7);
    });
  });

  describe('edge case — date offsets relative to runtime', () => {
    it('anchors started_at 14 days before the provided `now` and completed_at 7 days before', async () => {
      const batchRepo = buildRepoMock();
      const recipeRepo = buildRepoMock();
      const stepRepo = buildRepoMock();
      recipeRepo.findOne.mockResolvedValueOnce({
        id: DEMO_PUNK_IPA_RECIPE_ID,
      });
      batchRepo.findOne.mockResolvedValueOnce(null);
      stepRepo.findOne.mockResolvedValue(null);

      await seedDemoBatch(
        batchRepo as unknown as Repository<BatchOrmEntity>,
        recipeRepo as unknown as Repository<RecipeOrmEntity>,
        stepRepo as unknown as Repository<BatchStepOrmEntity>,
        FAKE_NOW,
      );

      const batchPayload = (batchRepo.create.mock.calls[0] as unknown[])[0] as {
        started_at: Date;
        completed_at: Date;
      };
      const expectedStart = new Date('2026-04-16T12:00:00.000Z');
      const expectedEnd = new Date('2026-04-23T12:00:00.000Z');
      expect(batchPayload.started_at.toISOString()).toBe(
        expectedStart.toISOString(),
      );
      expect(batchPayload.completed_at.toISOString()).toBe(
        expectedEnd.toISOString(),
      );
    });
  });
});
