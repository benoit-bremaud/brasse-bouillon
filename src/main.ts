import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { NestFactory } from '@nestjs/core';
import { TransformResponseInterceptor } from './common/interceptors';
import { ValidationPipe } from '@nestjs/common';

/**
 * Bootstrap function - Entry point of the NestJS application
 *
 * Initializes the application with:
 * - AppModule as root module
 * - Global ValidationPipe for automatic request validation
 * - Global TransformResponseInterceptor for standardized API responses
 * - Global AllExceptionsFilter for catching ALL exceptions
 * - Global HttpExceptionFilter for standardized HTTP error handling
 * - Listens on port 3000
 */
async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  // Global ValidationPipe - validates all incoming requests
  app.useGlobalPipes(new ValidationPipe());

  // Global Interceptors - Transforms successful responses
  app.useGlobalInterceptors(new TransformResponseInterceptor());

  // Global Filters - Order matters! AllExceptions FIRST, then HttpException
  app.useGlobalFilters(
    new AllExceptionsFilter(), // Catch ALL exceptions first
    new HttpExceptionFilter(), // Then HTTP-specific exceptions
  );

  await app.listen(3000);
}

bootstrap();
