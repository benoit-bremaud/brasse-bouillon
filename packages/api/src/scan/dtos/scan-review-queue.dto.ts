import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { ScanReviewQueueOrmEntity } from '../entities/scan-review-queue.orm.entity';
import { ScanReviewStatus } from '../domain/enums/scan-review-status.enum';

export class ScanReviewQueueDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  scan_request_id: string;

  @ApiProperty({ enum: ScanReviewStatus })
  status: ScanReviewStatus;

  @ApiPropertyOptional({ nullable: true })
  internal_note?: string | null;

  @ApiPropertyOptional({ nullable: true })
  reviewed_by?: string | null;

  @ApiPropertyOptional({ nullable: true })
  reviewed_at?: Date | null;

  @ApiProperty()
  created_at: Date;

  @ApiProperty()
  updated_at: Date;

  static fromEntity(entity: ScanReviewQueueOrmEntity): ScanReviewQueueDto {
    return {
      id: entity.id,
      scan_request_id: entity.scan_request_id,
      status: entity.status,
      internal_note: entity.internal_note ?? null,
      reviewed_by: entity.reviewed_by ?? null,
      reviewed_at: entity.reviewed_at ?? null,
      created_at: entity.created_at,
      updated_at: entity.updated_at,
    };
  }
}
