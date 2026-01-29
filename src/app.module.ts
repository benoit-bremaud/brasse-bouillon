import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';

/**
 * App Module
 *
 * Root module of the Brasse-Bouillon application.
 * Imports all feature modules and configures global services.
 *
 * @module AppModule
 *
 * @description
 * This is the main module that bootstraps the entire NestJS application.
 * It sets up:
 * - Global configuration management (ConfigModule)
 * - Database connection (DatabaseModule)
 * - User feature (UserModule)
 * - Authentication feature (AuthModule)
 * - Root controller and service
 *
 * Module dependency order matters:
 * 1. ConfigModule - loads .env variables
 * 2. DatabaseModule - connects to database (uses ConfigModule)
 * 3. UserModule - uses Database (depends on DatabaseModule)
 */
@Module({
  // Global configuration module - handles environment variables
  // isGlobal: true makes it available to all modules
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),

    // Database module - TypeORM configuration and connection
    DatabaseModule,

    // User feature module - User entity, service, and controller
    UserModule,

    // Authentication module - JWT, login, registration
    AuthModule,
  ],

  // Controllers that handle HTTP requests at root level
  controllers: [AppController],

  // Root services
  providers: [AppService],
})
export class AppModule {}
