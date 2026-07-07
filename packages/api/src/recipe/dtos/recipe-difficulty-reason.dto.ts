import { ApiProperty } from '@nestjs/swagger';

/**
 * One stored line of the difficulty tap-to-explain (ADR-0024 D4). Structurally
 * mirrors the domain `DifficultyReason` — the value the backend persists on the
 * recipe and the mobile renders as-is, without recomputing anything.
 */
export class RecipeDifficultyReasonDto {
  @ApiProperty({
    description:
      'Factor id that fired (e.g. "F1", or "facile" for the easy case).',
    example: 'F2',
  })
  factor: string;

  @ApiProperty({
    description: 'Factor tier: 0 = facile, 1 = intermediaire, 2 = avance.',
    example: 1,
  })
  tier: number;

  @ApiProperty({
    description:
      'Plain-French, glossed explanation shown when the badge is tapped.',
  })
  sentence: string;
}
