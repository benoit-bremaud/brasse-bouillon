import { ServiceUnavailableException } from '@nestjs/common';

/**
 * Thrown when the FAQ bot cannot answer: kill-switch off, monthly budget exceeded, or the
 * LLM provider failed/timed out. Maps to HTTP 503 and flows through the global
 * `HttpExceptionFilter` into the standard error envelope (`success: false`).
 */
export class FaqBotUnavailableException extends ServiceUnavailableException {
  constructor(reason = 'The FAQ chatbot is temporarily unavailable') {
    super(reason);
  }
}
