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
  @Transform(({ value }): unknown =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  readonly question!: string;

  @IsOptional()
  @IsString()
  @MaxLength(8000)
  readonly altcha?: string;
}
