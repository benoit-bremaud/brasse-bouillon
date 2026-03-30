import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';

import { ApiResponseDto } from '../dto/api-response.dto';
import { Observable } from 'rxjs';
import { Response } from 'express';
import { map } from 'rxjs/operators';

/**
 * Transform Response Interceptor
 *
 * Automatically wraps all successful responses in ApiResponseDto format
 *
 * Flow:
 * 1. Capture the controller response
 * 2. Wrap it with ApiResponseDto structure
 * 3. Return standardized response
 *
 * Before: { id: 1, email: "test@example.com" }
 * After: { success: true, statusCode: 200, message: "OK", data: { id: 1, email: "..." }, timestamp: "..." }
 */
@Injectable()
export class TransformResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const response = context.switchToHttp().getResponse<Response>();
    const statusCode = response.statusCode;

    return next.handle().pipe(
      map((data) => {
        // Determine message based on the HTTP status code
        const messageMap: Record<number, string> = {
          200: 'Success',
          201: 'Resource created successfully',
          204: 'No content',
        };

        const message = messageMap[statusCode] || 'Operation successful';

        // Return the standardized DTO
        return new ApiResponseDto(true, statusCode, message, data);
      }),
    );
  }
}
