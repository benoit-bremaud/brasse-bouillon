import { RecipeStepType } from '../../recipe/domain/enums/recipe-step-type.enum';
import { RecipeWorkflowService } from '../../recipe/domain/services/recipe-workflow.service';

import { BatchStepStatus } from './enums/batch-step-status.enum';
import { BatchStatus } from './enums/batch-status.enum';
import { BatchDomainService } from './services/batch-domain.service';

describe('BatchDomainService', () => {
  it('should start a batch and auto-start step 0', () => {
    const t0 = new Date('2026-02-05T09:00:00.000Z');
    const service = new BatchDomainService(() => t0);

    const workflow = new RecipeWorkflowService();
    const recipeSteps = workflow.getDefaultWorkflow();

    const batch = service.startBatch({
      id: 'batch-1',
      ownerId: 'user-1',
      recipeId: 'recipe-1',
      steps: recipeSteps,
    });

    expect(batch.status).toBe(BatchStatus.IN_PROGRESS);
    expect(batch.currentStepOrder).toBe(0);
    expect(batch.createdAt).toEqual(t0);
    expect(batch.startedAt).toEqual(t0);
    expect(batch.updatedAt).toEqual(t0);

    expect(batch.steps).toHaveLength(5);
    expect(batch.steps.map((s) => s.type)).toEqual<RecipeStepType[]>([
      RecipeStepType.MASH,
      RecipeStepType.BOIL,
      RecipeStepType.WHIRLPOOL,
      RecipeStepType.FERMENTATION,
      RecipeStepType.PACKAGING,
    ]);
    expect(batch.steps.map((s) => s.status)).toEqual([
      BatchStepStatus.IN_PROGRESS,
      BatchStepStatus.PENDING,
      BatchStepStatus.PENDING,
      BatchStepStatus.PENDING,
      BatchStepStatus.PENDING,
    ]);
    expect(batch.steps[0].startedAt).toEqual(t0);
  });

  it('should complete steps and auto-advance until completion', () => {
    const t0 = new Date('2026-02-05T09:00:00.000Z');
    const t1 = new Date('2026-02-05T09:10:00.000Z');
    const t2 = new Date('2026-02-05T09:20:00.000Z');
    const t3 = new Date('2026-02-05T09:30:00.000Z');
    const t4 = new Date('2026-02-05T09:40:00.000Z');
    const t5 = new Date('2026-02-05T09:50:00.000Z');

    const timestamps = [t0, t1, t2, t3, t4, t5];
    const service = new BatchDomainService(() => {
      const next = timestamps.shift();
      if (!next) throw new Error('Missing timestamp');
      return next;
    });

    const workflow = new RecipeWorkflowService();
    const recipeSteps = workflow.getDefaultWorkflow();

    let batch = service.startBatch({
      id: 'batch-1',
      ownerId: 'user-1',
      recipeId: 'recipe-1',
      steps: recipeSteps,
    });

    batch = service.completeCurrentStep(batch);
    expect(batch.currentStepOrder).toBe(1);
    expect(batch.steps[0].status).toBe(BatchStepStatus.COMPLETED);
    expect(batch.steps[0].completedAt).toEqual(t1);
    expect(batch.steps[1].status).toBe(BatchStepStatus.IN_PROGRESS);
    expect(batch.steps[1].startedAt).toEqual(t1);

    batch = service.completeCurrentStep(batch); // t2
    batch = service.completeCurrentStep(batch); // t3
    batch = service.completeCurrentStep(batch); // t4

    batch = service.completeCurrentStep(batch); // t5
    expect(batch.status).toBe(BatchStatus.COMPLETED);
    expect(batch.currentStepOrder).toBeUndefined();
    expect(batch.completedAt).toEqual(t5);
    expect(batch.steps[4].status).toBe(BatchStepStatus.COMPLETED);
    expect(batch.steps[4].completedAt).toEqual(t5);
  });

  it('should throw when completing an already completed batch', () => {
    const t0 = new Date('2026-02-05T09:00:00.000Z');
    const t1 = new Date('2026-02-05T09:10:00.000Z');
    const timestamps = [t0, t1];
    const service = new BatchDomainService(() => {
      const next = timestamps.shift();
      if (!next) throw new Error('Missing timestamp');
      return next;
    });

    const batch = service.startBatch({
      id: 'batch-1',
      ownerId: 'user-1',
      recipeId: 'recipe-1',
      steps: [
        {
          order: 0,
          type: RecipeStepType.MASH,
          label: 'Mash',
          description: 'Single-step test.',
        },
      ],
    });

    const completed = service.completeCurrentStep(batch);
    expect(completed.status).toBe(BatchStatus.COMPLETED);

    expect(() => service.completeCurrentStep(completed)).toThrow(
      'Batch is not in progress',
    );
  });

  it('should reject non-contiguous step orders', () => {
    const service = new BatchDomainService(
      () => new Date('2026-02-05T09:00:00.000Z'),
    );

    expect(() =>
      service.startBatch({
        id: 'batch-1',
        ownerId: 'user-1',
        recipeId: 'recipe-1',
        steps: [
          { order: 1, type: RecipeStepType.MASH, label: 'Mash' },
          { order: 2, type: RecipeStepType.BOIL, label: 'Boil' },
        ],
      }),
    ).toThrow('Step orders must start at 0 and be continuous');
  });

  it('should reject empty steps array', () => {
    const service = new BatchDomainService(
      () => new Date('2026-02-05T09:00:00.000Z'),
    );

    expect(() =>
      service.startBatch({
        id: 'batch-1',
        ownerId: 'user-1',
        recipeId: 'recipe-1',
        steps: [],
      }),
    ).toThrow('Batch must include at least one step');
  });

  it('should reject invalid step orders (negative and non-integer)', () => {
    const service = new BatchDomainService(
      () => new Date('2026-02-05T09:00:00.000Z'),
    );

    expect(() =>
      service.startBatch({
        id: 'batch-1',
        ownerId: 'user-1',
        recipeId: 'recipe-1',
        steps: [{ order: -1, type: RecipeStepType.MASH, label: 'Mash' }],
      }),
    ).toThrow('Step order must be a non-negative integer');

    expect(() =>
      service.startBatch({
        id: 'batch-1',
        ownerId: 'user-1',
        recipeId: 'recipe-1',
        steps: [{ order: 0.5, type: RecipeStepType.MASH, label: 'Mash' }],
      }),
    ).toThrow('Step order must be a non-negative integer');
  });

  it('should reject duplicate step orders', () => {
    const service = new BatchDomainService(
      () => new Date('2026-02-05T09:00:00.000Z'),
    );

    expect(() =>
      service.startBatch({
        id: 'batch-1',
        ownerId: 'user-1',
        recipeId: 'recipe-1',
        steps: [
          { order: 0, type: RecipeStepType.MASH, label: 'Mash' },
          { order: 0, type: RecipeStepType.BOIL, label: 'Boil' },
        ],
      }),
    ).toThrow('Step orders must be unique');
  });

  it('should reject empty step labels', () => {
    const service = new BatchDomainService(
      () => new Date('2026-02-05T09:00:00.000Z'),
    );

    expect(() =>
      service.startBatch({
        id: 'batch-1',
        ownerId: 'user-1',
        recipeId: 'recipe-1',
        steps: [{ order: 0, type: RecipeStepType.MASH, label: '   ' }],
      }),
    ).toThrow('Step label must not be empty');
  });
});
