import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, Max, Min } from 'class-validator';

/**
 * Optional query params for `GET /batches/:id/priming` (B3).
 *
 * The founder decision is "simple par défaut, précise en option": with no
 * params the endpoint returns the beginner-safe simple dose; when BOTH
 * `targetCo2Vol` and `beerTempC` are supplied it returns the precise,
 * temperature-corrected dose. Partial params fall back to the simple default.
 */
export class GetPrimingQueryDto {
  @ApiPropertyOptional({
    example: 2.4,
    description: 'Target carbonation in CO2 volumes (advanced, optional)',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(8)
  targetCo2Vol?: number;

  @ApiPropertyOptional({
    example: 20,
    description: 'Current beer temperature in °C (advanced, optional)',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(-10)
  @Max(120)
  beerTempC?: number;
}
