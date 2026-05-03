import { ApiProperty } from '@nestjs/swagger';

import { WaterOrmEntity } from '../entities/water.orm.entity';

/**
 * Read-only response DTO for the brewing water catalogue. Mirrors
 * the ORM row shape one-to-one (no field is computed). Built via
 * `WaterDto.fromEntity(entity)` rather than direct property access
 * so future shape changes (date serialisation, field renaming)
 * stay in this single conversion point.
 */
export class WaterDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ example: 'Burton on Trent, UK' })
  name: string;

  @ApiProperty({ example: 'United Kingdom', nullable: true })
  origin: string | null;

  @ApiProperty({ example: 295, nullable: true, description: 'Ca²⁺ (ppm)' })
  calcium_ppm: number | null;

  @ApiProperty({ example: 300, nullable: true, description: 'HCO₃⁻ (ppm)' })
  bicarbonate_ppm: number | null;

  @ApiProperty({ example: 725, nullable: true, description: 'SO₄²⁻ (ppm)' })
  sulfate_ppm: number | null;

  @ApiProperty({ example: 25, nullable: true, description: 'Cl⁻ (ppm)' })
  chloride_ppm: number | null;

  @ApiProperty({ example: 55, nullable: true, description: 'Na⁺ (ppm)' })
  sodium_ppm: number | null;

  @ApiProperty({ example: 45, nullable: true, description: 'Mg²⁺ (ppm)' })
  magnesium_ppm: number | null;

  @ApiProperty({ example: 8.0, nullable: true })
  ph: number | null;

  @ApiProperty({ nullable: true })
  notes: string | null;

  @ApiProperty({ format: 'date-time' })
  created_at: string;

  @ApiProperty({ format: 'date-time' })
  updated_at: string;

  static fromEntity(entity: WaterOrmEntity): WaterDto {
    const dto = new WaterDto();
    dto.id = entity.id;
    dto.name = entity.name;
    dto.origin = entity.origin;
    dto.calcium_ppm = entity.calcium_ppm;
    dto.bicarbonate_ppm = entity.bicarbonate_ppm;
    dto.sulfate_ppm = entity.sulfate_ppm;
    dto.chloride_ppm = entity.chloride_ppm;
    dto.sodium_ppm = entity.sodium_ppm;
    dto.magnesium_ppm = entity.magnesium_ppm;
    dto.ph = entity.ph;
    dto.notes = entity.notes;
    dto.created_at = entity.created_at.toISOString();
    dto.updated_at = entity.updated_at.toISOString();
    return dto;
  }
}
