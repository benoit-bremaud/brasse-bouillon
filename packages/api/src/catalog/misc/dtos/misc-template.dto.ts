import { ApiProperty } from '@nestjs/swagger';

import { MiscTemplateOrmEntity } from '../entities/misc-template.orm.entity';
import { MiscType, MiscUseAt } from '../domain/misc-template.types';

/**
 * Read-only response DTO for the misc template catalogue.
 * Mirrors the ORM row shape one-to-one. Built via
 * `MiscTemplateDto.fromEntity(entity)` rather than direct
 * property access so future shape changes (date serialisation,
 * field renaming) stay in this single conversion point.
 */
export class MiscTemplateDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ example: 'Coriandre (graines)' })
  name: string;

  @ApiProperty({ enum: MiscType, example: MiscType.Spice })
  type: MiscType;

  @ApiProperty({ enum: MiscUseAt, example: MiscUseAt.Boil })
  use_at: MiscUseAt;

  @ApiProperty({
    example: 0.02,
    description: 'Raw BeerXML AMOUNT — kg if amount_is_weight else L',
  })
  amount: number;

  @ApiProperty({ example: true })
  amount_is_weight: boolean;

  @ApiProperty({ example: 10, description: 'Minutes spent in the USE phase' })
  time_min: number;

  @ApiProperty({ nullable: true, example: 'Belgian Wit' })
  use_for: string | null;

  @ApiProperty({ nullable: true })
  notes: string | null;

  @ApiProperty({
    format: 'uuid',
    nullable: true,
    description:
      'FK to producers — brand of this misc (e.g. Lallemand for Servomyces)',
  })
  producer_id: string | null;

  @ApiProperty({ format: 'date-time' })
  created_at: string;

  @ApiProperty({ format: 'date-time' })
  updated_at: string;

  static fromEntity(entity: MiscTemplateOrmEntity): MiscTemplateDto {
    const dto = new MiscTemplateDto();
    dto.id = entity.id;
    dto.name = entity.name;
    dto.type = entity.type;
    dto.use_at = entity.use_at;
    dto.amount = entity.amount;
    dto.amount_is_weight = entity.amount_is_weight;
    dto.time_min = entity.time_min;
    dto.use_for = entity.use_for;
    dto.notes = entity.notes;
    dto.producer_id = entity.producer_id;
    dto.created_at = entity.created_at.toISOString();
    dto.updated_at = entity.updated_at.toISOString();
    return dto;
  }
}
