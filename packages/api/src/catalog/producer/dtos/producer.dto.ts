import { ApiProperty } from '@nestjs/swagger';

import { ProducerOrmEntity } from '../entities/producer.orm.entity';
import { ProducerType } from '../domain/producer.types';

/**
 * Read-only response DTO for the producer catalogue.
 * Mirrors the ORM row shape one-to-one. Built via
 * `ProducerDto.fromEntity(entity)` rather than direct property
 * access so future shape changes (date serialisation, field
 * renaming, joined producer surface on referenced catalogues)
 * stay in this single conversion point.
 */
export class ProducerDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ example: 'Wyeast Labs' })
  name: string;

  @ApiProperty({ enum: ProducerType, example: ProducerType.Laboratory })
  type: ProducerType;

  @ApiProperty({ nullable: true, example: 'US' })
  country: string | null;

  @ApiProperty({ nullable: true, example: 'https://www.wyeastlab.com' })
  website: string | null;

  @ApiProperty({ nullable: true })
  notes: string | null;

  @ApiProperty({ format: 'date-time' })
  created_at: string;

  @ApiProperty({ format: 'date-time' })
  updated_at: string;

  static fromEntity(entity: ProducerOrmEntity): ProducerDto {
    const dto = new ProducerDto();
    dto.id = entity.id;
    dto.name = entity.name;
    dto.type = entity.type;
    dto.country = entity.country;
    dto.website = entity.website;
    dto.notes = entity.notes;
    dto.created_at = entity.created_at.toISOString();
    dto.updated_at = entity.updated_at.toISOString();
    return dto;
  }
}
