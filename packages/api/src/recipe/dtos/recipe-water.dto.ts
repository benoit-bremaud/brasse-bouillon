import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { RecipeWaterOrmEntity } from '../entities/recipe-water.orm.entity';

export class RecipeWaterDto {
  @ApiProperty()
  recipe_id: string;

  @ApiProperty()
  mash_volume_l: number;

  @ApiProperty()
  sparge_volume_l: number;

  @ApiPropertyOptional({ nullable: true })
  mash_temperature_c: number | null;

  @ApiPropertyOptional({ nullable: true })
  sparge_temperature_c: number | null;

  @ApiPropertyOptional({ nullable: true })
  calcium_ppm: number | null;

  @ApiPropertyOptional({ nullable: true })
  magnesium_ppm: number | null;

  @ApiPropertyOptional({ nullable: true })
  sulfate_ppm: number | null;

  @ApiPropertyOptional({ nullable: true })
  chloride_ppm: number | null;

  @ApiPropertyOptional({ nullable: true })
  ph_target: number | null;

  @ApiProperty()
  created_at: Date;

  @ApiProperty()
  updated_at: Date;

  static fromEntity(e: RecipeWaterOrmEntity): RecipeWaterDto {
    const dto = new RecipeWaterDto();
    dto.recipe_id = e.recipe_id;
    dto.mash_volume_l = e.mash_volume_l;
    dto.sparge_volume_l = e.sparge_volume_l;
    dto.mash_temperature_c = e.mash_temperature_c ?? null;
    dto.sparge_temperature_c = e.sparge_temperature_c ?? null;
    dto.calcium_ppm = e.calcium_ppm ?? null;
    dto.magnesium_ppm = e.magnesium_ppm ?? null;
    dto.sulfate_ppm = e.sulfate_ppm ?? null;
    dto.chloride_ppm = e.chloride_ppm ?? null;
    dto.ph_target = e.ph_target ?? null;
    dto.created_at = e.created_at;
    dto.updated_at = e.updated_at;
    return dto;
  }
}
