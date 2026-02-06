import * as path from 'path';

import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { EquipmentProfileOrmEntity } from '../equipment/entities/equipment-profile.orm.entity';
import { BatchOrmEntity } from '../batch/entities/batch.orm.entity';
import { BatchStepOrmEntity } from '../batch/entities/batch-step.orm.entity';
import { BatchReminderOrmEntity } from '../batch/entities/batch-reminder.orm.entity';
import { RecipeOrmEntity } from '../recipe/entities/recipe.orm.entity';
import { RecipeStepOrmEntity } from '../recipe/entities/recipe-step.orm.entity';

/**
 * TypeORM Configuration
 *
 * Configures the connection to SQLite database with automatic schema synchronization.
 * In production, migrations should be used instead of synchronize: true.
 *
 * @function typeOrmConfig
 * @returns {TypeOrmModuleOptions} TypeORM module configuration
 *
 * @example
 * // Used in DatabaseModule
 * TypeOrmModule.forRoot(typeOrmConfig())
 */
export const typeOrmConfig = (): TypeOrmModuleOptions => {
  // Determine if we are in development or production
  const isDevelopment = process.env.NODE_ENV !== 'production';

  // Define database file path - can be overridden with DATABASE_PATH env var
  const dbPath =
    process.env.DATABASE_PATH ||
    path.join(process.cwd(), 'data', 'brasse-bouillon.db');

  return {
    // Use SQLite as the database type
    type: 'better-sqlite3',

    // Path to the SQLite database file
    database: dbPath,

    // List of entities (tables) that TypeORM should manage
    // When a new entity is created, add it here
    entities: [
      User,
      EquipmentProfileOrmEntity,
      BatchOrmEntity,
      BatchStepOrmEntity,
      BatchReminderOrmEntity,
      RecipeOrmEntity,
      RecipeStepOrmEntity,
    ],

    // Automatically create/update database schema on application startup
    // WARNING: Only use in development! Use migrations in production.
    synchronize: isDevelopment,

    // Enable query and error logging in development
    logging: isDevelopment ? ['query', 'error', 'warn'] : ['error'],

    // Use simple console logger for better readability
    logger: 'simple-console',
  };
};
