import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { RecipeHopAdditionStage } from '../domain/enums/recipe-hop-addition-stage.enum';
import { RecipeHopType } from '../domain/enums/recipe-hop-type.enum';

export class RecipeIbuBreakdownHopDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440321' })
  hop_id: string;

  @ApiProperty({ example: 'Cascade' })
  variety: string;

  @ApiProperty({ enum: RecipeHopType, example: RecipeHopType.PELLET })
  type: RecipeHopType;

  @ApiProperty({
    enum: RecipeHopAdditionStage,
    example: RecipeHopAdditionStage.BOIL,
  })
  addition_stage: RecipeHopAdditionStage;

  @ApiPropertyOptional({ nullable: true, example: 60 })
  addition_time_min: number | null;

  @ApiProperty({ example: 28 })
  weight_g: number;

  @ApiPropertyOptional({ nullable: true, example: 5.5 })
  alpha_acid_percent: number | null;

  @ApiProperty({
    example: 0.2537,
    description: 'Final utilization coefficient applied to this hop',
  })
  utilization: number;

  @ApiProperty({ example: 17.76, description: 'IBU contribution for this hop' })
  ibu: number;
}
