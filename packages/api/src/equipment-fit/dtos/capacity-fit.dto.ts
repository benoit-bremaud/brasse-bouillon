import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { CapacityFit } from '../domain/capacity-fit';
import {
  FermenterReason,
  FermenterVerdict,
  KettleReason,
  KettleVerdict,
} from '../domain/enums/capacity-verdict.enum';

/**
 * Response of `GET /recipes/:id/equipment-fit` (ADR-0026). One shape for every
 * case: a `NOT_EVALUATED` leg carries a `reason` and leaves its numbers null.
 */
export class CapacityFitDto {
  @ApiProperty({ enum: FermenterVerdict, example: FermenterVerdict.FITS })
  fermenter: FermenterVerdict;

  @ApiPropertyOptional({
    enum: FermenterReason,
    nullable: true,
    description: 'Set only when `fermenter` is NOT_EVALUATED.',
  })
  fermenterReason: FermenterReason | null;

  @ApiProperty({ enum: KettleVerdict, example: KettleVerdict.OK })
  kettle: KettleVerdict;

  @ApiPropertyOptional({
    enum: KettleReason,
    nullable: true,
    description: 'Set only when `kettle` is NOT_EVALUATED.',
  })
  kettleReason: KettleReason | null;

  @ApiPropertyOptional({ nullable: true, example: 4.5 })
  fermenterUsableL: number | null;

  @ApiPropertyOptional({ nullable: true, example: 4.3 })
  recipeVolumeL: number | null;

  @ApiPropertyOptional({ nullable: true, example: 6.2 })
  preBoilL: number | null;

  @ApiPropertyOptional({ nullable: true, example: 10 })
  kettleCapacityL: number | null;

  @ApiPropertyOptional({
    nullable: true,
    example: 4.6,
    description: 'Divide the recipe by this to fit; set only on TOO_LARGE.',
  })
  scaleRatio: number | null;

  static fromDomain(fit: CapacityFit): CapacityFitDto {
    const dto = new CapacityFitDto();
    dto.fermenter = fit.fermenter;
    dto.fermenterReason = fit.fermenterReason;
    dto.kettle = fit.kettle;
    dto.kettleReason = fit.kettleReason;
    dto.fermenterUsableL = fit.fermenterUsableL;
    dto.recipeVolumeL = fit.recipeVolumeL;
    dto.preBoilL = fit.preBoilL;
    dto.kettleCapacityL = fit.kettleCapacityL;
    dto.scaleRatio = fit.scaleRatio;
    return dto;
  }
}
