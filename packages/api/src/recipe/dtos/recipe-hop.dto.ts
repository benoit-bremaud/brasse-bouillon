import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { RecipeHopAdditionStage } from '../domain/enums/recipe-hop-addition-stage.enum';
import { RecipeHopOrmEntity } from '../entities/recipe-hop.orm.entity';
import { RecipeHopType } from '../domain/enums/recipe-hop-type.enum';

export class RecipeHopDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  recipe_id: string;

  @ApiProperty()
  variety: string;

  @ApiProperty({ enum: RecipeHopType })
  type: RecipeHopType;

  @ApiProperty()
  weight_g: number;

  @ApiPropertyOptional({ nullable: true })
  alpha_acid_percent: number | null;

  @ApiProperty({ enum: RecipeHopAdditionStage })
  addition_stage: RecipeHopAdditionStage;

  @ApiPropertyOptional({ nullable: true })
  addition_time_min: number | null;

  @ApiProperty()
  created_at: Date;

  @ApiProperty()
  updated_at: Date;

  static fromEntity(e: RecipeHopOrmEntity): RecipeHopDto {
    const dto = new RecipeHopDto();
    dto.id = e.id;
    dto.recipe_id = e.recipe_id;
    dto.variety = e.variety;
    dto.type = e.type;
    dto.weight_g = e.weight_g;
    dto.alpha_acid_percent = e.alpha_acid_percent ?? null;
    dto.addition_stage = e.addition_stage;
    dto.addition_time_min = e.addition_time_min ?? null;
    dto.created_at = e.created_at;
    dto.updated_at = e.updated_at;
    return dto;
  }
}
