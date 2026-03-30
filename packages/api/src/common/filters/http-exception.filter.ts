import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

interface ErrorResponse {
  statusCode: number;
  message: string;
  timestamp: string;
  path: string;
}

/**
 * Global HTTP Exception Filter
 *
 * Catches all HttpException thrown in the application
 * and transforms them into standardized JSON responses
 *
 * Example:
 * - Service throws ConflictException("Email already exists")
 * - This filter catches the exception
 * - Returns standardized JSON to the client:
 *   { statusCode: 409, message: "Email already exists", timestamp: "...", path: "..." }
 */
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  /**
   * Extracts error message from exception response
   * Ensures type safety and handles various response formats
   * - String response: returns as is
   * - Object with message property: extracts message
   * - Array of messages: returns first message
   * - Default: returns "Internal Server Error"
   */
  private extractMessage(exceptionResponse: unknown): string {
    // Handle string responses
    if (typeof exceptionResponse === 'string') {
      return exceptionResponse;
    }

    // Handle object responses
    if (
      typeof exceptionResponse === 'object' &&
      exceptionResponse !== null &&
      'message' in exceptionResponse
    ) {
      const exceptionObj = exceptionResponse as Record<string, unknown>;
      const messageProperty = exceptionObj.message;

      // Handle string message property
      if (typeof messageProperty === 'string') {
        return messageProperty;
      }

      // Handle array message property (e.g., validation errors)
      if (Array.isArray(messageProperty)) {
        // Type guard: messageProperty is now unknown[]
        const messageArray = messageProperty as unknown[];

        if (messageArray.length > 0) {
          const firstElement = messageArray[0];
          if (typeof firstElement === 'string') {
            return firstElement;
          }
        }
      }
    }

    // Default fallback
    return 'Internal Server Error';
  }

  /**
   * Catches HttpException and sends standardized JSON response
   *
   * @param exception - The thrown exception (e.g., ConflictException)
   * @param host - Contains request, response, and other context
   */
  catch(exception: HttpException, host: ArgumentsHost): void {
    // Extract HTTP context
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // Get HTTP status code (409, 400, 404, etc.)
    const status = exception.getStatus();

    // Get raw exception response
    const exceptionResponse = exception.getResponse();

    // Extract error message safely with type checking
    const message = this.extractMessage(exceptionResponse);

    // Build standardized error response
    const errorResponse: ErrorResponse = {
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    // Log error for debugging
    this.logger.error(
      `[${status}] ${errorResponse.message} - ${request.method} ${request.url}`,
      exception.stack,
    );

    // Send JSON response to client
    response.status(status).json(errorResponse);
  }
}
