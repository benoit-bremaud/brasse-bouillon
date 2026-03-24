import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { RecipeFermentableOrmEntity } from '../entities/recipe-fermentable.orm.entity';
import { RecipeFermentableType } from '../domain/enums/recipe-fermentable-type.enum';

export class RecipeFermentableDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  recipe_id: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ enum: RecipeFermentableType })
  type: RecipeFermentableType;

  @ApiProperty()
  weight_g: number;

  @ApiPropertyOptional({ nullable: true })
  potential_gravity: number | null;

  @ApiPropertyOptional({ nullable: true })
  color_ebc: number | null;

  @ApiProperty()
  created_at: Date;

  @ApiProperty()
  updated_at: Date;

  static fromEntity(e: RecipeFermentableOrmEntity): RecipeFermentableDto {
    const dto = new RecipeFermentableDto();
    dto.id = e.id;
    dto.recipe_id = e.recipe_id;
    dto.name = e.name;
    dto.type = e.type;
    dto.weight_g = e.weight_g;
    dto.potential_gravity = e.potential_gravity ?? null;
    dto.color_ebc = e.color_ebc ?? null;
    dto.created_at = e.created_at;
    dto.updated_at = e.updated_at;
    return dto;
  }
}
