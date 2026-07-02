import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { RecipeStepType } from '../../recipe/domain/enums/recipe-step-type.enum';

import { BatchStepStatus } from '../domain/enums/batch-step-status.enum';
import { BatchStepOrmEntity } from '../entities/batch-step.orm.entity';

/** One PRÉP-phase gesture with its pedagogical why (F4, brew-day/01+06). */
export class StepPrepActionDto {
  @ApiProperty({ description: 'The physical gesture, imperative French' })
  action: string;

  @ApiProperty({ description: "The gesture's one-line pedagogical why" })
  why: string;
}

export class BatchStepDto {
  @ApiProperty()
  batch_id: string;

  @ApiProperty()
  step_order: number;

  @ApiProperty({ enum: RecipeStepType })
  type: RecipeStepType;

  @ApiProperty()
  label: string;

  @ApiPropertyOptional({ nullable: true })
  description?: string | null;

  @ApiProperty({ enum: BatchStepStatus })
  status: BatchStepStatus;

  @ApiPropertyOptional({ nullable: true })
  started_at?: Date | null;

  @ApiPropertyOptional({ nullable: true })
  completed_at?: Date | null;

  @ApiPropertyOptional({ nullable: true })
  planned_duration_min?: number | null;

  @ApiPropertyOptional({ nullable: true })
  pedagogical_tip?: string | null;

  @ApiPropertyOptional({ type: [StepPrepActionDto], nullable: true })
  prep_actions?: StepPrepActionDto[] | null;

  @ApiProperty()
  created_at: Date;

  @ApiProperty()
  updated_at: Date;

  static fromEntity(e: BatchStepOrmEntity): BatchStepDto {
    return {
      batch_id: e.batch_id,
      step_order: e.step_order,
      type: e.type,
      label: e.label,
      description: e.description ?? null,
      status: e.status,
      started_at: e.started_at ?? null,
      completed_at: e.completed_at ?? null,
      planned_duration_min: e.planned_duration_min ?? null,
      pedagogical_tip: e.pedagogical_tip ?? null,
      prep_actions: e.prep_actions ?? null,
      created_at: e.created_at,
      updated_at: e.updated_at,
    };
  }
}
