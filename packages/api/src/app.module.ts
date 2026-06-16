import {
  buildBootstrapEnvironmentConfig,
  environmentValidationSchema,
} from './config/environment.config';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { BatchModule } from './batch/batch.module';
import { BeerContributionModule } from './beer-contribution/beer-contribution.module';
import { CatalogModule } from './catalog/catalog.module';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { EquipmentModule } from './equipment/equipment.module';
import { FeedbackModule } from './feedback/feedback.module';
import { HealthModule } from './health/health.module';
import { LabelModule } from './label/label.module';
import { Module } from '@nestjs/common';
import { RecipeModule } from './recipe/recipe.module';
import { ScanModule } from './scan/scan.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { UserModule } from './user/user.module';
import { WaterModule } from './water/water.module';

const bootstrapEnvironment = buildBootstrapEnvironmentConfig();

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
      envFilePath: bootstrapEnvironment.envFilePaths,
      ignoreEnvFile: bootstrapEnvironment.ignoreEnvFile,
      validationSchema: environmentValidationSchema,
      validationOptions: {
        abortEarly: false,
        allowUnknown: true,
      },
    }),

    ThrottlerModule.forRoot([
      {
        ttl: 60_000,
        limit: 10,
      },
    ]),

    // Liveness probe - public GET /health, no database dependency.
    // Registered before DatabaseModule to reflect that it never touches
    // persistence (the Docker HEALTHCHECK targets it instead of root `/`).
    HealthModule,

    // Database module - TypeORM configuration and connection
    DatabaseModule,

    // User feature module - User entity, service, and controller
    UserModule,

    // Authentication module - JWT, login, registration
    AuthModule,

    // Equipment feature module - user equipment profiles
    EquipmentModule,

    // Recipe feature module - user recipes
    RecipeModule,
    BatchModule,
    WaterModule,
    LabelModule,
    ScanModule,

    // Feedback module - public POST /feedback endpoint (epic #1026, #1027)
    FeedbackModule,

    // Beer contribution module - 501 stubs anticipating the v0.2+
    // community contribution flow (Epic #693 part 4/5, ADR-0001 clause 3).
    BeerContributionModule,

    // Reference catalogues (hop / fermentable / yeast / style /
    // mash-profile / water / equipment / misc) — operator-curated
    // immutable data consumed by the recipe and brewing flows.
    // Issue #708 / #869, Phase 1 PR #1 ships HopModule.
    CatalogModule,
  ],

  // Controllers that handle HTTP requests at root level
  controllers: [AppController],

  // Root services
  providers: [AppService],
})
export class AppModule {}
