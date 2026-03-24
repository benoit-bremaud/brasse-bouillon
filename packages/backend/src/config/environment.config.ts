import Joi from 'joi';

export const APP_ENVIRONMENTS = [
  'development',
  'test',
  'staging',
  'production',
] as const;
export const NODE_ENVIRONMENTS = ['development', 'test', 'production'] as const;

export type AppEnvironment = (typeof APP_ENVIRONMENTS)[number];
export type NodeEnvironment = (typeof NODE_ENVIRONMENTS)[number];

const BOOLEAN_ENV_PATTERN = /^(1|0|true|false|yes|no|on|off)$/i;
const DEFAULT_HUBEAU_BASE_URL =
  'https://hubeau.eaufrance.fr/api/v1/qualite_eau_potable';

const APP_ENV_TO_NODE_ENV: Record<AppEnvironment, NodeEnvironment> = {
  development: 'development',
  test: 'test',
  staging: 'production',
  production: 'production',
};

const NODE_ENV_TO_DEFAULT_APP_ENV: Record<NodeEnvironment, AppEnvironment> = {
  development: 'development',
  test: 'test',
  production: 'production',
};

const normalizeAppEnvironment = (
  value: string | undefined,
): AppEnvironment | null => {
  const normalized = value?.trim().toLowerCase();
  if (!normalized) {
    return null;
  }

  if ((APP_ENVIRONMENTS as readonly string[]).includes(normalized)) {
    return normalized as AppEnvironment;
  }

  return null;
};

const normalizeNodeEnvironment = (
  value: string | undefined,
): NodeEnvironment | null => {
  const normalized = value?.trim().toLowerCase();
  if (!normalized) {
    return null;
  }

  if ((NODE_ENVIRONMENTS as readonly string[]).includes(normalized)) {
    return normalized as NodeEnvironment;
  }

  return null;
};

const assertValidAppEnvironment = (
  rawAppEnv: string | undefined,
  appEnv: AppEnvironment | null,
): void => {
  if (rawAppEnv === undefined || appEnv) {
    return;
  }

  const receivedValue = rawAppEnv.trim() || '(empty string)';
  throw new Error(
    `Invalid APP_ENV value: "${receivedValue}". Expected one of: ${APP_ENVIRONMENTS.join(', ')}`,
  );
};

const assertValidNodeEnvironment = (
  rawNodeEnv: string | undefined,
  nodeEnv: NodeEnvironment | null,
): void => {
  if (rawNodeEnv === undefined || nodeEnv) {
    return;
  }

  const receivedValue = rawNodeEnv.trim() || '(empty string)';
  throw new Error(
    `Invalid NODE_ENV value: "${receivedValue}". Expected one of: ${NODE_ENVIRONMENTS.join(', ')}`,
  );
};

export interface BootstrapEnvironmentConfig {
  readonly appEnv: AppEnvironment;
  readonly nodeEnv: NodeEnvironment;
  readonly envFilePaths: string[];
  readonly ignoreEnvFile: boolean;
}

const assertEnvCompatibility = (
  appEnv: AppEnvironment,
  nodeEnv: NodeEnvironment,
): void => {
  const expectedNodeEnv = APP_ENV_TO_NODE_ENV[appEnv];
  if (expectedNodeEnv === nodeEnv) {
    return;
  }

  throw new Error(
    `Incompatible environment values: APP_ENV=${appEnv} requires NODE_ENV=${expectedNodeEnv}, received NODE_ENV=${nodeEnv}`,
  );
};

export const resolveBootstrapEnvironment = (
  rawAppEnv = process.env.APP_ENV,
  rawNodeEnv = process.env.NODE_ENV,
): Pick<BootstrapEnvironmentConfig, 'appEnv' | 'nodeEnv'> => {
  const appEnv = normalizeAppEnvironment(rawAppEnv);
  const nodeEnv = normalizeNodeEnvironment(rawNodeEnv);

  assertValidAppEnvironment(rawAppEnv, appEnv);
  assertValidNodeEnvironment(rawNodeEnv, nodeEnv);

  if (appEnv && nodeEnv) {
    assertEnvCompatibility(appEnv, nodeEnv);
    return { appEnv, nodeEnv };
  }

  if (appEnv) {
    return { appEnv, nodeEnv: APP_ENV_TO_NODE_ENV[appEnv] };
  }

  if (nodeEnv) {
    return {
      appEnv: NODE_ENV_TO_DEFAULT_APP_ENV[nodeEnv],
      nodeEnv,
    };
  }

  return {
    appEnv: 'development',
    nodeEnv: 'development',
  };
};

export const resolveEnvFilePaths = (appEnv: AppEnvironment): string[] => {
  switch (appEnv) {
    case 'test':
      return ['.env.test.local', '.env.test', '.env.local', '.env'];
    case 'staging':
      return ['.env.staging.local', '.env.staging', '.env.local', '.env'];
    case 'production':
      return [];
    case 'development':
    default:
      return [
        '.env.development.local',
        '.env.development',
        '.env.local',
        '.env',
      ];
  }
};

export const shouldIgnoreEnvFile = (appEnv: AppEnvironment): boolean =>
  appEnv === 'production';

export const buildBootstrapEnvironmentConfig =
  (): BootstrapEnvironmentConfig => {
    const { appEnv, nodeEnv } = resolveBootstrapEnvironment();

    process.env.APP_ENV = appEnv;
    process.env.NODE_ENV = nodeEnv;

    return {
      appEnv,
      nodeEnv,
      envFilePaths: resolveEnvFilePaths(appEnv),
      ignoreEnvFile: shouldIgnoreEnvFile(appEnv),
    };
  };

export const environmentValidationSchema: Joi.ObjectSchema = Joi.object({
  APP_ENV: Joi.string()
    .valid(...APP_ENVIRONMENTS)
    .required(),
  NODE_ENV: Joi.string()
    .valid(...NODE_ENVIRONMENTS)
    .required(),

  JWT_SECRET: Joi.string().min(24).required(),
  JWT_EXPIRATION: Joi.string().trim().min(2).default('86400s'),
  PORT: Joi.number().integer().min(1).max(65535).default(3000),

  DATABASE_PATH: Joi.string()
    .trim()
    .min(1)
    .default('./data/brasse-bouillon.db'),
  TYPEORM_MIGRATIONS_RUN: Joi.string()
    .pattern(BOOLEAN_ENV_PATTERN)
    .default('false'),
  TYPEORM_SYNCHRONIZE: Joi.string()
    .pattern(BOOLEAN_ENV_PATTERN)
    .default('false'),
  TYPEORM_LOGGING: Joi.string().pattern(BOOLEAN_ENV_PATTERN).optional(),

  SWAGGER_ENABLED: Joi.string().pattern(BOOLEAN_ENV_PATTERN).optional(),

  SEED_ENDPOINTS_ENABLED: Joi.string()
    .pattern(BOOLEAN_ENV_PATTERN)
    .default('false'),
  SEED_ENDPOINTS_TOKEN: Joi.string().allow('').optional(),

  WATER_PROVIDER_DEFAULT: Joi.string().valid('hubeau').default('hubeau'),
  HUBEAU_BASE_URL: Joi.string()
    .uri({ scheme: ['http', 'https'] })
    .default(DEFAULT_HUBEAU_BASE_URL),
  HUBEAU_TIMEOUT_MS: Joi.number()
    .integer()
    .min(1_000)
    .max(60_000)
    .default(8_000),
  HUBEAU_CACHE_TTL_SECONDS: Joi.number()
    .integer()
    .min(60)
    .max(86_400)
    .default(3_600),
  HUBEAU_MAX_SAMPLES: Joi.number().integer().min(1).max(500).default(50),
  HUBEAU_COMMUNES_UDI_SIZE: Joi.number().integer().min(1).max(100).default(10),
  HUBEAU_RESULTATS_DIS_SIZE: Joi.number()
    .integer()
    .min(1)
    .max(5_000)
    .default(100),
})
  .unknown(true)
  .required();
