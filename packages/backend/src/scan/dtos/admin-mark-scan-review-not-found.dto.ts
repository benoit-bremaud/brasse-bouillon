import { IsOptional, IsString, Length } from 'class-validator';

import { ApiPropertyOptional } from '@nestjs/swagger';

export class AdminMarkScanReviewNotFoundDto {
  @ApiPropertyOptional({
    example:
      'No reliable match found after research on producer website and catalog',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  @Length(0, 2_000)
  internal_note?: string;
}
