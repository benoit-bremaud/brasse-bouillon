import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { ScanCatalogItemDto } from './scan-catalog-item.dto';
import { ScanLabelImageDto } from './scan-label-image.dto';
import { ScanRequestOrmEntity } from '../entities/scan-request.orm.entity';
import { ScanRequestStatus } from '../domain/enums/scan-request-status.enum';
import { ScanReviewQueueDto } from './scan-review-queue.dto';

export class ScanRequestDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  owner_id: string;

  @ApiProperty()
  barcode: string;

  @ApiProperty({ enum: ScanRequestStatus })
  status: ScanRequestStatus;

  @ApiProperty()
  idempotency_key: string;

  @ApiProperty()
  consent_ai_training: boolean;

  @ApiProperty()
  retention_until: Date;

  @ApiPropertyOptional({ nullable: true })
  catalog_item_id?: string | null;

  @ApiProperty()
  created_at: Date;

  @ApiProperty()
  updated_at: Date;

  @ApiPropertyOptional({ type: ScanCatalogItemDto, nullable: true })
  catalog_item?: ScanCatalogItemDto | null;

  @ApiPropertyOptional({ type: ScanReviewQueueDto, nullable: true })
  review_queue?: ScanReviewQueueDto | null;

  @ApiProperty({ type: ScanLabelImageDto, isArray: true })
  images: ScanLabelImageDto[];

  static fromEntity(
    entity: ScanRequestOrmEntity,
    options?: {
      catalogItem?: ScanCatalogItemDto | null;
      reviewQueue?: ScanReviewQueueDto | null;
      images?: ScanLabelImageDto[];
    },
  ): ScanRequestDto {
    return {
      id: entity.id,
      owner_id: entity.owner_id,
      barcode: entity.barcode,
      status: entity.status,
      idempotency_key: entity.idempotency_key,
      consent_ai_training: entity.consent_ai_training,
      retention_until: entity.retention_until,
      catalog_item_id: entity.catalog_item_id ?? null,
      created_at: entity.created_at,
      updated_at: entity.updated_at,
      catalog_item: options?.catalogItem ?? null,
      review_queue: options?.reviewQueue ?? null,
      images: options?.images ?? [],
    };
  }
}
