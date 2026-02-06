import { ApiProperty } from '@nestjs/swagger';

import { BatchStepOrmEntity } from '../entities/batch-step.orm.entity';
import { BatchOrmEntity } from '../entities/batch.orm.entity';

import { BatchStepDto } from './batch-step.dto';
import { BatchSummaryDto } from './batch-summary.dto';

export class BatchDto extends BatchSummaryDto {
  @ApiProperty({ type: BatchStepDto, isArray: true })
  steps: BatchStepDto[];

  static fromEntities(
    batch: BatchOrmEntity,
    steps: BatchStepOrmEntity[],
  ): BatchDto {
    return {
      ...BatchSummaryDto.fromEntity(batch),
      steps: steps.map((step) => BatchStepDto.fromEntity(step)),
    };
  }
}
