import * as path from 'path';

import { BatchOrmEntity } from '../batch/entities/batch.orm.entity';
import { BatchReminderOrmEntity } from '../batch/entities/batch-reminder.orm.entity';
import { BatchStepOrmEntity } from '../batch/entities/batch-step.orm.entity';
import { DataSourceOptions } from 'typeorm';
import { EquipmentProfileOrmEntity } from '../equipment/entities/equipment-profile.orm.entity';
import { RecipeOrmEntity } from '../recipe/entities/recipe.orm.entity';
import { RecipeStepOrmEntity } from '../recipe/entities/recipe-step.orm.entity';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';

const truthyEnvValues = new Set(['1', 'true', 'yes', 'on']);
const falsyEnvValues = new Set(['0', 'false', 'no', 'off']);

export const ormEntities = [
  User,
  EquipmentProfileOrmEntity,
  BatchOrmEntity,
  BatchStepOrmEntity,
  BatchReminderOrmEntity,
  RecipeOrmEntity,
  RecipeStepOrmEntity,
];

const parseBooleanEnv = (name: string, defaultValue: boolean): boolean => {
  const raw = process.env[name];

  if (raw === undefined) {
    return defaultValue;
  }

  const normalized = raw.trim().toLowerCase();
  if (truthyEnvValues.has(normalized)) {
    return true;
  }
  if (falsyEnvValues.has(normalized)) {
    return false;
  }

  return defaultValue;
};

const resolveTypeOrmLogging = (
  isProduction: boolean,
  isTest: boolean,
): DataSourceOptions['logging'] => {
  const verboseLogging = parseBooleanEnv(
    'TYPEORM_LOGGING',
    !isProduction && !isTest,
  );

  return verboseLogging ? ['query', 'error', 'warn'] : ['error'];
};

/**
 * TypeORM Configuration
 *
 * Configures the SQLite connection used by Nest runtime and TypeORM CLI.
 * Schema evolution is migration-first (`synchronize` disabled by default).
 *
 * @function typeOrmConfig
 * @returns {TypeOrmModuleOptions} TypeORM module configuration
 *
 * @example
 * // Used in DatabaseModule
 * TypeOrmModule.forRoot(typeOrmConfig())
 */
export const buildTypeOrmOptions = (): DataSourceOptions => {
  const isProduction = process.env.NODE_ENV === 'production';
  const isTest = process.env.NODE_ENV === 'test';

  const dbPath =
    process.env.DATABASE_PATH ||
    path.join(process.cwd(), 'data', 'brasse-bouillon.db');

  const synchronize = parseBooleanEnv('TYPEORM_SYNCHRONIZE', false);
  const migrationsRun = parseBooleanEnv('TYPEORM_MIGRATIONS_RUN', false);

  return {
    type: 'better-sqlite3',
    database: dbPath,
    entities: ormEntities,
    migrations: [path.join(__dirname, 'migrations', '*.{ts,js}')],
    migrationsRun,
    synchronize,
    logging: resolveTypeOrmLogging(isProduction, isTest),
    logger: 'simple-console',
  };
};

export const typeOrmConfig = (): TypeOrmModuleOptions => buildTypeOrmOptions();
