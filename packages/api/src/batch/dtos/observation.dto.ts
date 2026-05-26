import { ApiProperty } from '@nestjs/swagger';

import { ObservationOrmEntity } from '../entities/observation.orm.entity';

/** Serialised observation returned by the API (#607). */
export class ObservationDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  batch_id: string;

  @ApiProperty({ nullable: true })
  step_order: number | null;

  @ApiProperty()
  free_text: string;

  @ApiProperty({ type: [String] })
  photo_refs: string[];

  @ApiProperty({ nullable: true })
  mood_score: number | null;

  @ApiProperty()
  observed_at: Date;

  @ApiProperty()
  created_at: Date;

  static fromEntity(e: ObservationOrmEntity): ObservationDto {
    return {
      id: e.id,
      batch_id: e.batch_id,
      step_order: e.step_order ?? null,
      free_text: e.free_text,
      photo_refs: e.photo_refs ?? [],
      mood_score: e.mood_score ?? null,
      observed_at: e.observed_at,
      created_at: e.created_at,
    };
  }
}
