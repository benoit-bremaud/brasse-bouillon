import { ApiProperty } from '@nestjs/swagger';

import { TastingOrmEntity } from '../entities/tasting.orm.entity';

/** Serialised tasting returned by the API (B3). */
export class TastingDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  batch_id: string;

  @ApiProperty({ minimum: 1, maximum: 5 })
  rating: number;

  @ApiProperty({ nullable: true })
  note: string | null;

  @ApiProperty()
  created_at: Date;

  static fromEntity(e: TastingOrmEntity): TastingDto {
    return {
      id: e.id,
      batch_id: e.batch_id,
      rating: e.rating,
      note: e.note ?? null,
      created_at: e.created_at,
    };
  }
}
