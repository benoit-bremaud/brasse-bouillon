import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { NestFactory } from '@nestjs/core';
import { TransformResponseInterceptor } from './common/interceptors';
import { ValidationPipe } from '@nestjs/common';
import { useContainer } from 'class-validator';

/**
 * Bootstrap function - Entry point of the NestJS application
 *
 * Initializes the application with:
 * - AppModule as root module
 * - Global ValidationPipe for automatic request validation
 * - Global TransformResponseInterceptor for standardized API responses
 * - Global AllExceptionsFilter for catching ALL exceptions
 * - Global HttpExceptionFilter for standardized HTTP error handling
 * - Swagger/OpenAPI documentation setup
 * - Listens on port 3000
 */
async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  // Register NestJS container with class-validator
  // This allows custom validators to inject dependencies properly
  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  // Global ValidationPipe - validates all incoming requests
  app.useGlobalPipes(new ValidationPipe());

  // Global Interceptors - Transforms successful responses
  app.useGlobalInterceptors(new TransformResponseInterceptor());

  // Global Filters - Order matters! AllExceptions FIRST, then HttpException
  app.useGlobalFilters(
    new AllExceptionsFilter(), // Catch ALL exceptions first
    new HttpExceptionFilter(), // Then HTTP-specific exceptions
  );

  // ============================================
  // SWAGGER CONFIGURATION
  // ============================================
  const config = new DocumentBuilder()
    .setTitle('Brasse-Bouillon API')
    .setDescription(
      'API for managing artisanal brewing recipes, ingredients, and processes',
    )
    .setVersion('1.0.0')
    .addServer('http://localhost:3000', 'Development')
    .addServer('https://api.brasse-bouillon.com', 'Production')
    .addTag('Users', 'User management endpoints')
    .addTag('Auth', 'Authentication endpoints')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  // ============================================

  await app.listen(3000);
  console.log(`🍺 Brasse-Bouillon API running on http://localhost:3000`);
  console.log(
    `📚 Swagger documentation available at http://localhost:3000/api`,
  );
}

bootstrap();
