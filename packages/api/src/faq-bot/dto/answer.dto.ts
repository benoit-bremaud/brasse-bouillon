/**
 * Response shape for `POST /faq-bot/ask`.
 *
 * The controller returns this plain object; the global `TransformResponseInterceptor`
 * wraps it into the standard `{ success, statusCode, message, data }` envelope.
 */
export interface AnswerDto {
  readonly answer: string;
}
