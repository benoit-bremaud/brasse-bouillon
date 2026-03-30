import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { RecipeStepType } from '../../recipe/domain/enums/recipe-step-type.enum';

import { BatchStepStatus } from '../domain/enums/batch-step-status.enum';
import { BatchStepOrmEntity } from '../entities/batch-step.orm.entity';

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
      created_at: e.created_at,
      updated_at: e.updated_at,
    };
  }
}
