import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';

/**
 * Bootstrap function - Entry point of the NestJS application
 *
 * Initializes the application with:
 * - AppModule as root module
 * - Global ValidationPipe for automatic request validation
 * - Global HttpExceptionFilter for standardized error handling
 * - Listens on port 3000
 */
async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  // Global ValidationPipe - validates all incoming requests
  app.useGlobalPipes(new ValidationPipe());

  // Global HttpExceptionFilter - catches all HTTP exceptions
  app.useGlobalFilters(new HttpExceptionFilter());

  await app.listen(3000);
}

bootstrap();
