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

  it('maps the PRÉP actions with their pedagogical why (happy, F4)', () => {
    const prep = [
      { action: 'Chauffe ~7 L à ~72 °C.', why: 'Le grain refroidit l’eau.' },
    ];
    const dto = BatchStepDto.fromEntity(makeEntity({ prep_actions: prep }));
    expect(dto.prep_actions).toEqual(prep);
  });

  it('nulls prep_actions for legacy or packaging steps (edge)', () => {
    expect(BatchStepDto.fromEntity(makeEntity()).prep_actions).toBeNull();
    expect(
      BatchStepDto.fromEntity(makeEntity({ prep_actions: null })).prep_actions,
    ).toBeNull();
  });

  it('maps the end condition and nulls it for legacy steps (happy/edge, F5)', () => {
    expect(
      BatchStepDto.fromEntity(makeEntity({ done_when: 'Quand ~60 min.' }))
        .done_when,
    ).toBe('Quand ~60 min.');
    expect(BatchStepDto.fromEntity(makeEntity()).done_when).toBeNull();
  });
});
