import * as path from 'path';

import { BatchOrmEntity } from '../batch/entities/batch.orm.entity';
import { BatchReminderOrmEntity } from '../batch/entities/batch-reminder.orm.entity';
import { BatchStepOrmEntity } from '../batch/entities/batch-step.orm.entity';
import { DataSourceOptions } from 'typeorm';
import { DistributorOrmEntity } from '../catalog/distributor/entities/distributor.orm.entity';
import { EquipmentProfileOrmEntity } from '../equipment/entities/equipment-profile.orm.entity';
import { EquipmentTemplateDistributorOrmEntity } from '../catalog/equipment/entities/equipment-template-distributor.orm.entity';
import { EquipmentTemplateOrmEntity } from '../catalog/equipment/entities/equipment-template.orm.entity';
import { Feedback } from '../feedback/entities/feedback.entity';
import { FermentableDistributorOrmEntity } from '../catalog/fermentable/entities/fermentable-distributor.orm.entity';
import { FermentableOrmEntity } from '../catalog/fermentable/entities/fermentable.orm.entity';
import { HopDistributorOrmEntity } from '../catalog/hop/entities/hop-distributor.orm.entity';
import { HopOrmEntity } from '../catalog/hop/entities/hop.orm.entity';
import { LabelDraftOrmEntity } from '../label/entities/label-draft.orm.entity';
import { MashProfileOrmEntity } from '../catalog/mash/entities/mash-profile.orm.entity';
import { MashStepOrmEntity } from '../catalog/mash/entities/mash-step.orm.entity';
import { MeasurementOrmEntity } from '../batch/entities/measurement.orm.entity';
import { MiscTemplateDistributorOrmEntity } from '../catalog/misc/entities/misc-template-distributor.orm.entity';
import { MiscTemplateOrmEntity } from '../catalog/misc/entities/misc-template.orm.entity';
import { ProducerOrmEntity } from '../catalog/producer/entities/producer.orm.entity';
import { RecipeAdditiveOrmEntity } from '../recipe/entities/recipe-additive.orm.entity';
import { RecipeFermentableOrmEntity } from '../recipe/entities/recipe-fermentable.orm.entity';
import { RecipeHopOrmEntity } from '../recipe/entities/recipe-hop.orm.entity';
import { RecipeOrmEntity } from '../recipe/entities/recipe.orm.entity';
import { RecipeStepOrmEntity } from '../recipe/entities/recipe-step.orm.entity';
import { RecipeWaterOrmEntity } from '../recipe/entities/recipe-water.orm.entity';
import { RecipeYeastOrmEntity } from '../recipe/entities/recipe-yeast.orm.entity';
import { ScanCatalogItemOrmEntity } from '../scan/entities/scan-catalog-item.orm.entity';
import { ScanLabelImageOrmEntity } from '../scan/entities/scan-label-image.orm.entity';
import { ScanRequestOrmEntity } from '../scan/entities/scan-request.orm.entity';
import { ScanReviewQueueOrmEntity } from '../scan/entities/scan-review-queue.orm.entity';
import { StyleOrmEntity } from '../catalog/style/entities/style.orm.entity';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { WaterOrmEntity } from '../catalog/water/entities/water.orm.entity';
import { YeastDistributorOrmEntity } from '../catalog/yeast/entities/yeast-distributor.orm.entity';
import { YeastOrmEntity } from '../catalog/yeast/entities/yeast.orm.entity';

const truthyEnvValues = new Set(['1', 'true', 'yes', 'on']);
const falsyEnvValues = new Set(['0', 'false', 'no', 'off']);

export const ormEntities = [
  User,
  EquipmentProfileOrmEntity,
  BatchOrmEntity,
  BatchStepOrmEntity,
  BatchReminderOrmEntity,
  MeasurementOrmEntity,
  RecipeOrmEntity,
  RecipeStepOrmEntity,
  RecipeFermentableOrmEntity,
  RecipeHopOrmEntity,
  RecipeYeastOrmEntity,
  RecipeAdditiveOrmEntity,
  RecipeWaterOrmEntity,
  LabelDraftOrmEntity,
  ScanRequestOrmEntity,
  ScanCatalogItemOrmEntity,
  ScanLabelImageOrmEntity,
  ScanReviewQueueOrmEntity,
  HopOrmEntity,
  FermentableOrmEntity,
  YeastOrmEntity,
  StyleOrmEntity,
  MashProfileOrmEntity,
  MashStepOrmEntity,
  WaterOrmEntity,
  EquipmentTemplateOrmEntity,
  MiscTemplateOrmEntity,
  ProducerOrmEntity,
  DistributorOrmEntity,
  HopDistributorOrmEntity,
  FermentableDistributorOrmEntity,
  YeastDistributorOrmEntity,
  MiscTemplateDistributorOrmEntity,
  EquipmentTemplateDistributorOrmEntity,
  Feedback,
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
 * Pass `{ forCli: true }` from CLI entry points (`data-source.ts`) so that
 * `migration:generate` / `migration:revert` do not auto-run pending
 * migrations before executing the requested command. Runtime callers
 * (Nest `TypeOrmModule.forRoot`) get `migrationsRun: true` by default.
 *
 * @function buildTypeOrmOptions
 * @param {{ forCli?: boolean }} [opts] CLI flag (defaults to runtime)
 * @returns {DataSourceOptions} TypeORM data source options
 */
export const buildTypeOrmOptions = (opts?: {
  forCli?: boolean;
}): DataSourceOptions => {
  const isProduction = process.env.NODE_ENV === 'production';
  const isTest = process.env.NODE_ENV === 'test';

  const dbPath =
    process.env.DATABASE_PATH ||
    path.join(process.cwd(), 'data', 'brasse-bouillon.db');

  return {
    type: 'better-sqlite3',
    database: dbPath,
    entities: ormEntities,
    migrations: [path.join(__dirname, 'migrations', '*.{ts,js}')],
    migrationsRun: !opts?.forCli,
    synchronize: false,
    logging: resolveTypeOrmLogging(isProduction, isTest),
    logger: 'simple-console',
  };
};

export const typeOrmConfig = (): TypeOrmModuleOptions => buildTypeOrmOptions();
