import { ApiProperty } from '@nestjs/swagger';

import {
  PrimingResult,
  SAFETY_WARNING,
  SugarType,
} from '../domain/services/priming-calculator';

/**
 * Priming-sugar guidance returned by `GET /batches/:id/priming` (B3). Carries
 * the computed dose plus the mandatory bottle-bomb safety warning. The volume
 * comes from the recipe (ADR-0020) — never recomputed here.
 *
 * Serialised in snake_case to match every other batch DTO (and the mobile
 * `mapPriming` reader); the camelCase domain {@link PrimingResult} is mapped in
 * {@link PrimingDto.fromResult}.
 */
export class PrimingDto {
  @ApiProperty({ example: 28, description: 'Priming sugar dose in grams' })
  sugar_grams: number;

  @ApiProperty({ enum: SugarType })
  sugar_type: SugarType;

  @ApiProperty({
    example: 2.4,
    description: 'Target carbonation in CO2 volumes',
  })
  target_co2_vol: number;

  @ApiProperty({
    example: 4.3,
    description: 'Beer volume to bottle, in litres',
  })
  volume_l: number;

  @ApiProperty({ description: 'Mandatory bottle-bomb safety warning (French)' })
  safety_warning: string;

  static fromResult(result: PrimingResult): PrimingDto {
    return {
      sugar_grams: result.sugarGrams,
      sugar_type: result.sugarType,
      target_co2_vol: result.targetCo2Vol,
      volume_l: result.volumeL,
      safety_warning: SAFETY_WARNING,
    };
  }
}
