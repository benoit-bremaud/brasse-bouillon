import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

/**
 * Global All-Exceptions Filter
 *
 * Catches ALL exceptions (including non-HTTP ones like TypeError, Error, etc.)
 * Logs full error details for debugging
 *
 * Order matters:
 * 1. AllExceptionsFilter catches everything
 * 2. HttpExceptionFilter catches HTTP-specific exceptions
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status = HttpStatus.INTERNAL_SERVER_ERROR;
    const isProduction = process.env.NODE_ENV === 'production';
    let message = 'Internal server error';

    // Extract details based on exception type
    if (exception instanceof Error) {
      if (!isProduction) {
        message = exception.message;
      }
      this.logger.error(
        `Unhandled Error: ${exception.message}`,
        exception.stack,
      );
    } else {
      this.logger.error('Unhandled Exception:', JSON.stringify(exception));
    }

    const errorResponse = {
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    response.status(status).json(errorResponse);
  }
}
