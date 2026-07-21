import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { BatchStepOrmEntity } from '../entities/batch-step.orm.entity';
import { BatchOrmEntity } from '../entities/batch.orm.entity';

import { BatchStepDto } from './batch-step.dto';
import { BatchSummaryDto } from './batch-summary.dto';

export class BatchDto extends BatchSummaryDto {
  @ApiProperty({ type: BatchStepDto, isArray: true })
  steps: BatchStepDto[];

  // Checked prep-item ids carried by an « en préparation » draft (F14). Null
  // when nothing was ever checked; the checklist items themselves are derived
  // from the recipe on the client — only the coches live on the batch.
  @ApiPropertyOptional({ type: String, isArray: true, nullable: true })
  prep_checked_ids?: string[] | null;

  static fromEntities(
    batch: BatchOrmEntity,
    steps: BatchStepOrmEntity[],
  ): BatchDto {
    const currentStep =
      batch.current_step_order != null
        ? (steps.find((step) => step.step_order === batch.current_step_order) ??
          null)
        : null;
    return {
      ...BatchSummaryDto.fromEntity(batch, currentStep),
      steps: steps.map((step) => BatchStepDto.fromEntity(step)),
      prep_checked_ids: batch.prep_checked_ids ?? null,
    };
  }
}
