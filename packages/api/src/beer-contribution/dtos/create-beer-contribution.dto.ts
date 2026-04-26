import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

/**
 * Stub DTO for the v0.2+ community beer contribution flow (Epic #693
 * part 4/5). The shape anticipates the future endpoint without
 * committing to its semantics — the controller currently returns
 * 501 Not Implemented per ADR-0001 clause 3 (deferred endpoints ship
 * as documented stubs rather than missing routes, so frontend code can
 * be written against the future contract).
 *
 * Final field set will be settled when the community contribution
 * feature lands. Keep this DTO permissive (all fields optional with
 * loose validation) so client integrations are not silently rejected
 * before the real implementation arrives.
 */
export class CreateBeerContributionDto {
  @ApiPropertyOptional({
    description: 'Display name of the beer the user wants to contribute.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  name?: string;

  @ApiPropertyOptional({
    description:
      'Brewery name. Will be matched / created server-side in v0.2+.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  brewery?: string;

  @ApiPropertyOptional({
    description:
      'BJCP-style category. Free-text in the stub; mapped to a controlled vocabulary in v0.2+.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  style?: string;

  @ApiPropertyOptional({
    description:
      'Free-text notes from the contributor (origin story, tasting impressions, recipe hints).',
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({
    description:
      'EAN-13 barcode of the beer being contributed. Stored on the eventual scan_catalog_items row when the contribution is approved. Optional in the v0.1 stub (the whole DTO is permissive); will likely become required when the v0.2+ service ships.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(32)
  barcode?: string;
}
