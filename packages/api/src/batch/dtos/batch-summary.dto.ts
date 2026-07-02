import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import {
  deriveEffectiveStatus,
  EFFECTIVE_BATCH_STATUSES,
} from '../domain/enums/batch-status.enum';
import type { EffectiveBatchStatus } from '../domain/enums/batch-status.enum';
import { BatchOrmEntity } from '../entities/batch.orm.entity';

export class BatchSummaryDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  owner_id: string;

  @ApiProperty()
  recipe_id: string;

  // Effective lifecycle status: the brewing status (in_progress | completed)
  // unless the batch is a never-launched draft, or was cancelled or archived
  // (derived, archived > cancelled > draft — brew-day/07).
  @ApiProperty({
    enum: EFFECTIVE_BATCH_STATUSES,
    description: 'draft | in_progress | completed | cancelled | archived',
  })
  status: EffectiveBatchStatus;

  @ApiPropertyOptional({ nullable: true })
  current_step_order?: number | null;

  // Null while the batch is an « en préparation » draft (the brew has not
  // started); stamped at launch. The raw column stays NOT NULL for schema
  // stability — the DTO hides the placeholder a draft row carries.
  @ApiPropertyOptional({ nullable: true })
  started_at: Date | null;

  @ApiPropertyOptional({ nullable: true })
  fermentation_started_at?: Date | null;

  @ApiPropertyOptional({ nullable: true })
  fermentation_completed_at?: Date | null;

  @ApiPropertyOptional({ nullable: true })
  bottled_at?: Date | null;

  @ApiPropertyOptional({ nullable: true })
  completed_at?: Date | null;

  @ApiPropertyOptional({ nullable: true })
  cancelled_at?: Date | null;

  @ApiPropertyOptional({ nullable: true })
  archived_at?: Date | null;

  @ApiProperty()
  created_at: Date;

  @ApiProperty()
  updated_at: Date;

  static fromEntity(e: BatchOrmEntity): BatchSummaryDto {
    return {
      id: e.id,
      owner_id: e.owner_id,
      recipe_id: e.recipe_id,
      status: deriveEffectiveStatus(
        e.status,
        e.cancelled_at,
        e.archived_at,
        e.launched_at,
      ),
      current_step_order: e.current_step_order ?? null,
      started_at: e.launched_at ? e.started_at : null,
      fermentation_started_at: e.fermentation_started_at ?? null,
      fermentation_completed_at: e.fermentation_completed_at ?? null,
      bottled_at: e.bottled_at ?? null,
      completed_at: e.completed_at ?? null,
      cancelled_at: e.cancelled_at ?? null,
      archived_at: e.archived_at ?? null,
      created_at: e.created_at,
      updated_at: e.updated_at,
    };
  }
}
