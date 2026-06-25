import { RecipeStepType } from '../../recipe/domain/enums/recipe-step-type.enum';

import { BatchStepStatus } from '../domain/enums/batch-step-status.enum';
import { BatchStepOrmEntity } from '../entities/batch-step.orm.entity';

import { BatchStepDto } from './batch-step.dto';

function makeEntity(
  overrides: Partial<BatchStepOrmEntity> = {},
): BatchStepOrmEntity {
  return Object.assign(new BatchStepOrmEntity(), {
    batch_id: 'b1',
    step_order: 0,
    type: RecipeStepType.MASH,
    label: 'Mash',
    description: 'd',
    status: BatchStepStatus.IN_PROGRESS,
    started_at: null,
    completed_at: null,
    created_at: new Date('2026-02-05T09:00:00.000Z'),
    updated_at: new Date('2026-02-05T09:00:00.000Z'),
    ...overrides,
  });
}

describe('BatchStepDto.fromEntity', () => {
  it('maps the pedagogical tip and planned duration (happy)', () => {
    const dto = BatchStepDto.fromEntity(
      makeEntity({ planned_duration_min: 60, pedagogical_tip: 'pourquoi' }),
    );
    expect(dto.planned_duration_min).toBe(60);
    expect(dto.pedagogical_tip).toBe('pourquoi');
  });

  it('nulls them for legacy steps without enrichment (edge)', () => {
    const dto = BatchStepDto.fromEntity(makeEntity());
    expect(dto.planned_duration_min).toBeNull();
    expect(dto.pedagogical_tip).toBeNull();
  });
});
