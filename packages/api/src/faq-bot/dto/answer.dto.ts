import { ApiProperty } from '@nestjs/swagger';

/**
 * Response shape for `POST /faq-bot/ask`.
 *
 * The controller returns this plain object; the global `TransformResponseInterceptor`
 * wraps it into the standard `{ success, statusCode, message, data }` envelope. It is a
 * class (not an interface) so `@nestjs/swagger` can emit a response schema, matching the
 * other output DTOs in this API (e.g. `WaterProfileDto`).
 */
export class AnswerDto {
  @ApiProperty({
    description:
      'The chatbot answer to the visitor question (single block, no history).',
  })
  readonly answer!: string;
}
