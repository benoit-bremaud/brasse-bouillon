import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { NestFactory } from '@nestjs/core';
import { TransformResponseInterceptor } from './common/interceptors';
import { ValidationPipe } from '@nestjs/common';
import { useContainer } from 'class-validator';

/**
 * Brasse-Bouillon API - Bootstrap Entry Point
 *
 * This is the main entry point of the NestJS application.
 * Initializes and configures the entire API with all necessary middleware, filters, interceptors, and documentation.
 *
 * Initialization flow:
 * 1. Create NestJS application instance (AppModule as root)
 * 2. Register class-validator container (for dependency injection in custom validators)
 * 3. Setup global pipes (automatic request validation)
 * 4. Setup global interceptors (response transformation)
 * 5. Setup global filters (exception handling)
 * 6. Configure Swagger/OpenAPI documentation
 * 7. Start HTTP server on port 3000
 *
 * Server information:
 * - Production API: https://api.brasse-bouillon.com
 * - Development API: http://localhost:3000
 * - Swagger UI: http://localhost:3000/api
 * - ReDoc: http://localhost:3000/api-docs
 *
 * @async
 * @function bootstrap
 * @returns {Promise<void>} Resolves when server starts listening
 *
 * @example
 * // Called at end of file to start the application
 * bootstrap().catch((err) => {
 *   console.error('Failed to bootstrap application:', err);
 *   process.exit(1);
 * });
 */
async function bootstrap(): Promise<void> {
  // ============================================================================
  // 🚀 APPLICATION CREATION
  // ============================================================================

  /**
   * Create NestJS application instance
   *
   * AppModule is the root module that contains:
   * - All feature modules (Auth, User, etc.)
   * - Database configuration (TypeORM)
   * - Global providers (services, guards, etc.)
   */
  const app = await NestFactory.create(AppModule);

  // ============================================================================
  // 🔧 CONFIGURATION
  // ============================================================================

  /**
   * Register NestJS Container with class-validator
   *
   * Allows custom validators (IsUniqueEmail, IsUniqueUsername, etc.) to:
   * - Inject NestJS services (e.g., UserRepository, UserService)
   * - Access database for uniqueness checks
   * - Work properly with dependency injection
   *
   * The fallbackOnErrors option prevents errors if container is not found
   */
  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  // ============================================================================
  // 📝 GLOBAL PIPES - REQUEST VALIDATION
  // ============================================================================

  /**
   * Global ValidationPipe
   *
   * Automatically validates ALL incoming HTTP requests against DTOs.
   *
   * Features:
   * - Validates class fields using class-validator decorators
   * - Transforms payload types (strings to numbers, etc.)
   * - Strips unknown properties (whitelist)
   * - Returns 400 Bad Request with validation errors if validation fails
   *
   * Applied to:
   * - POST /users (CreateUserDto)
   * - PATCH /users/me (UpdateUserDto)
   * - POST /auth/login (LoginDto)
   * - POST /users/me/change-password (ChangePasswordDto)
   * - All other endpoints with @Body() parameters
   *
   * Performance:
   * - Runs asynchronously (non-blocking)
   * - Custom validators can be async (database queries)
   */
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      stopAtFirstError: true,
    }),
  );

  // ============================================================================
  // 🔄 GLOBAL INTERCEPTORS - RESPONSE TRANSFORMATION
  // ============================================================================

  /**
   * Global TransformResponseInterceptor
   *
   * Transforms ALL successful HTTP responses to standardized format.
   *
   * Output format:
   * {
   *   "success": true,
   *   "statusCode": 200,
   *   "message": "Success",
   *   "data": { ... },
   *   "timestamp": "2025-11-03T17:00:00.000Z"
   * }
   *
   * Benefits:
   * - Consistent API response structure
   * - Easier frontend integration
   * - Clear distinction between data and metadata
   * - Automatic timestamp tracking for audit trail
   *
   * Note:
   * - Only applies to successful responses (2xx status codes)
   * - Errors are handled by global filters (see below)
   */
  app.useGlobalInterceptors(new TransformResponseInterceptor());

  // ============================================================================
  // 🛡️ GLOBAL FILTERS - EXCEPTION HANDLING
  // ============================================================================

  /**
   * Global Exception Filters (Order matters!)
   *
   * Two-layer exception handling for different error types:
   *
   * 1. AllExceptionsFilter - CATCHES FIRST (most specific)
   *    - Catches ANY exception that bubbles up
   *    - Handles unexpected errors gracefully
   *    - Transforms them to standardized error format
   *    - Logs errors for debugging
   *
   * 2. HttpExceptionFilter - CATCHES SECOND (catch-all)
   *    - Handles NestJS built-in HTTP exceptions
   *    - BadRequestException, NotFoundException, etc.
   *    - Returns standardized HTTP error responses
   *    - Preserves status codes and error messages
   *
   * Error response format:
   * {
   *   "statusCode": 400,
   *   "message": "Validation failed",
   *   "timestamp": "2025-11-03T17:00:00.000Z"
   * }
   *
   * Order is critical:
   * - AllExceptionsFilter first: catches unexpected errors
   * - HttpExceptionFilter second: handles HTTP-specific errors
   * - If order reversed: HTTP errors bypass AllExceptions
   *
   * Security:
   * - Prevents sensitive stack traces from leaking to clients
   * - Logs detailed errors server-side for debugging
   * - Returns generic error messages to clients
   */
  app.useGlobalFilters(
    new AllExceptionsFilter(), // Catches all exceptions (layer 1)
    new HttpExceptionFilter(), // Catches HTTP exceptions (layer 2)
  );

  // ============================================================================
  // 📚 SWAGGER/OPENAPI CONFIGURATION
  // ============================================================================

  /**
   * Swagger Documentation Configuration
   *
   * Generates interactive API documentation accessible at /api
   * Allows API consumers to:
   * - Explore all available endpoints
   * - Understand request/response schemas
   * - Try endpoints directly in browser
   * - Generate client code
   *
   * Available at:
   * - /api (Swagger UI)
   * - /api-json (OpenAPI JSON specification)
   */
  const swaggerConfig = new DocumentBuilder()
    // Basic metadata
    .setTitle('🍺 Brasse-Bouillon API')
    .setDescription(
      'RESTful API for managing artisanal brewing recipes, ingredients, and brewing processes. ' +
        'Complete user management, authentication, and recipe documentation system.',
    )
    .setVersion('1.0.0')
    .setContact(
      'Brasse-Bouillon Team',
      'https://brasse-bouillon.com',
      'support@brasse-bouillon.com',
    )
    .setLicense('MIT', 'https://opensource.org/licenses/MIT')

    // Servers
    .addServer('http://localhost:3000', 'Development - Local')
    .addServer('https://api-dev.brasse-bouillon.com', 'Development - Staging')
    .addServer('https://api.brasse-bouillon.com', 'Production')

    // Tags (for grouping endpoints)
    .addTag('Users', 'User management and profile operations', {
      description:
        'Endpoints for creating users, managing profiles, and authentication',
      url: '',
    })
    .addTag('Auth', 'Authentication and authorization', {
      description: 'Login, logout, and JWT token management',
      url: '',
    })

    // Security schemes
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description:
          'Enter JWT token obtained from login endpoint. Token format: Bearer [jwt_token]',
        in: 'header',
      },
      'JWT-auth', // Reference name for use in endpoint decorators
    )
    .build();

  /**
   * Create Swagger/OpenAPI document
   *
   * Generates OpenAPI specification based on:
   * - Swagger config (title, description, etc.)
   * - NestJS route metadata
   * - Swagger decorators (@ApiOperation, @ApiResponse, etc.)
   * - DTO class definitions
   */
  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);

  /**
   * Setup Swagger UI
   *
   * Makes documentation available at:
   * - /api (Swagger UI interactive interface)
   * - /api-json (Raw OpenAPI JSON specification)
   * - /api-yaml (Raw OpenAPI YAML specification)
   */
  SwaggerModule.setup('api', app, swaggerDocument);

  // ============================================================================
  // 🌐 SERVER STARTUP
  // ============================================================================

  /**
   * Start listening on port 3000
   *
   * After this line:
   * - Server begins accepting HTTP requests
   * - All global middleware/pipes/filters/interceptors are active
   * - Swagger documentation is available
   * - Database connections are initialized
   */
  const port = 3000;
  await app.listen(port);

  // ============================================================================
  // 📋 STARTUP LOGGING
  // ============================================================================

  console.log('\n');
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║  🍺  BRASSE-BOUILLON API - STARTED SUCCESSFULLY  🍺        ║');
  console.log('╠════════════════════════════════════════════════════════════╣');
  console.log(
    `║  🌐 API Server:     http://localhost:${port}                  ║`,
  );
  console.log(
    `║  📚 Swagger UI:     http://localhost:${port}/api              ║`,
  );
  console.log(
    `║  📄 OpenAPI JSON:   http://localhost:${port}/api-json         ║`,
  );
  console.log('║                                                            ║');
  console.log('║  Ready to receive requests!                                ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log('\n');
}

// ============================================================================
// 🎯 APPLICATION ENTRY POINT
// ============================================================================

/**
 * Call bootstrap function to start the application
 *
 * If bootstrap fails:
 * - Error is caught and logged
 * - Process exits with code 1 (error status)
 * - This ensures application doesn't run in broken state
 */
void bootstrap().catch((err: Error) => {
  console.error('❌ Failed to bootstrap application:', err);
  process.exit(1);
});
