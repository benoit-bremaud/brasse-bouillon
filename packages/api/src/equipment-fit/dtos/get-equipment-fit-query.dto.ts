import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

/**
 * Query for `GET /recipes/:id/equipment-fit`. `profileId` is optional: when
 * omitted, the backend resolves the caller's default equipment profile (their
 * only one, or the most-recently-created — ADR-0026, no persisted default marker
 * yet).
 */
export class GetEquipmentFitQueryDto {
  @ApiPropertyOptional({
    description:
      'Explicit equipment profile id; defaults to the most-recent profile.',
    maxLength: 36,
  })
  @IsOptional()
  @IsString()
  @MaxLength(36)
  profileId?: string;
}
