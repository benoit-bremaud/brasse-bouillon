import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

/**
 * Request body for `POST /faq-bot/ask`.
 *
 * `question` is trimmed and length-capped (input cost/abuse control, ADR-0022).
 * `altcha` is the solved proof-of-work payload the `BotCheckGuard` verifies; it is optional
 * so the guard can bypass when no HMAC secret is configured (dev/CI).
 */
export class AskQuestionDto {
  @ApiProperty({
    description:
      'The visitor question about the project (trimmed, max 500 chars).',
    maxLength: 500,
  })
  @Transform(({ value }): unknown =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  readonly question!: string;

  @ApiPropertyOptional({
    description:
      'Solved ALTCHA proof-of-work payload (base64). Required only when the anti-bot secret is configured.',
    maxLength: 8000,
  })
  @IsOptional()
  @IsString()
  @MaxLength(8000)
  readonly altcha?: string;
}
