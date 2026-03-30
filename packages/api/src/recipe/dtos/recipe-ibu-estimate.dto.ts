import {
  TinsethHopResult,
  TinsethResult,
} from '../domain/services/recipe-ibu-tinseth.domain.service';

import { ApiProperty } from '@nestjs/swagger';
import { RecipeHopOrmEntity } from '../entities/recipe-hop.orm.entity';
import { RecipeIbuBreakdownHopDto } from './recipe-ibu-breakdown-hop.dto';

export class RecipeIbuEstimateDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440001' })
  recipe_id: string;

  @ApiProperty({
    example: 31.48,
    description: 'Total bitterness estimate in IBU using Tinseth formula',
  })
  ibu: number;

  @ApiProperty({
    type: RecipeIbuBreakdownHopDto,
    isArray: true,
    description: 'Per-hop IBU contribution breakdown',
  })
  breakdown: RecipeIbuBreakdownHopDto[];

  static fromTinseth(
    recipeId: string,
    result: TinsethResult,
  ): RecipeIbuEstimateDto {
    const dto = new RecipeIbuEstimateDto();
    dto.recipe_id = recipeId;
    dto.ibu = result.ibu;
    dto.breakdown = result.hops.map((hop) =>
      RecipeIbuEstimateDto.mapHopResult(hop),
    );
    return dto;
  }

  static fromUnestimated(
    recipeId: string,
    hops: RecipeHopOrmEntity[],
  ): RecipeIbuEstimateDto {
    const dto = new RecipeIbuEstimateDto();
    dto.recipe_id = recipeId;
    dto.ibu = 0;
    dto.breakdown = hops.map((hop) => ({
      hop_id: hop.id,
      variety: hop.variety,
      type: hop.type,
      addition_stage: hop.addition_stage,
      addition_time_min: hop.addition_time_min ?? null,
      weight_g: hop.weight_g,
      alpha_acid_percent: hop.alpha_acid_percent ?? null,
      utilization: 0,
      ibu: 0,
    }));
    return dto;
  }

  private static mapHopResult(hop: TinsethHopResult): RecipeIbuBreakdownHopDto {
    return {
      hop_id: hop.hopId,
      variety: hop.variety,
      type: hop.type,
      addition_stage: hop.additionStage,
      addition_time_min: hop.additionTimeMin,
      weight_g: hop.weightG,
      alpha_acid_percent: hop.alphaAcidPercent,
      utilization: hop.utilization,
      ibu: hop.ibu,
    };
  }
}
