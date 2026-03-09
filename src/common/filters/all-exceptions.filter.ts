import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
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

  private extractHttpExceptionMessage(
    responseBody: unknown,
    fallback: string,
  ): string {
    if (typeof responseBody === 'string') {
      return responseBody;
    }

    if (
      typeof responseBody === 'object' &&
      responseBody !== null &&
      'message' in responseBody
    ) {
      const message = (responseBody as { message?: unknown }).message;

      if (typeof message === 'string') {
        return message;
      }

      if (Array.isArray(message)) {
        const firstStringMessage = message.find(
          (item: unknown): item is string => typeof item === 'string',
        );

        if (firstStringMessage) {
          return firstStringMessage;
        }
      }
    }

    return fallback;
  }

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      const message = this.extractHttpExceptionMessage(
        exceptionResponse,
        exception.message,
      );

      response.status(status).json({
        statusCode: status,
        message,
        timestamp: new Date().toISOString(),
        path: request.url,
      });
      return;
    }

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
