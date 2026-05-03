import { ApiProperty } from '@nestjs/swagger';

import { MashProfileOrmEntity } from '../entities/mash-profile.orm.entity';

/**
 * Lean response DTO for the mash profile **list** endpoint
 * (`GET /catalog/mash-profiles`). Carries only the fields the
 * picker UI needs to render a row — no steps, no equipment
 * adjustment metadata, no thermal calculation columns.
 *
 * Use `MashProfileDto` (with the embedded steps array) for the
 * detail endpoint (`GET /catalog/mash-profiles/:id`).
 *
 * The split exists because lugging the full step tree on every
 * list response inflates the payload by ~10x (roughly 10 KB → 100
 * KB on a fully-seeded catalogue). The picker doesn't need that
 * — it just shows names and a one-line description.
 */
export class MashProfileSummaryDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ example: 'Single Infusion 65°C 60min (American Pale / IPA)' })
  name: string;

  @ApiProperty({ nullable: true })
  notes: string | null;

  @ApiProperty({ format: 'date-time' })
  created_at: string;

  @ApiProperty({ format: 'date-time' })
  updated_at: string;

  static fromEntity(entity: MashProfileOrmEntity): MashProfileSummaryDto {
    const dto = new MashProfileSummaryDto();
    dto.id = entity.id;
    dto.name = entity.name;
    dto.notes = entity.notes;
    dto.created_at = entity.created_at.toISOString();
    dto.updated_at = entity.updated_at.toISOString();
    return dto;
  }
}
