import {
  buildBootstrapEnvironmentConfig,
  resolveBootstrapEnvironment,
  resolveEnvFilePaths,
  shouldIgnoreEnvFile,
} from './environment.config';

describe('resolveBootstrapEnvironment', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    delete process.env.APP_ENV;
    delete process.env.NODE_ENV;
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('should default to development when APP_ENV and NODE_ENV are undefined', () => {
    expect(resolveBootstrapEnvironment()).toEqual({
      appEnv: 'development',
      nodeEnv: 'development',
    });
  });

  it('should derive NODE_ENV from APP_ENV when only APP_ENV is provided', () => {
    expect(resolveBootstrapEnvironment('staging', undefined)).toEqual({
      appEnv: 'staging',
      nodeEnv: 'production',
    });
  });

  it('should derive APP_ENV from NODE_ENV when only NODE_ENV is provided', () => {
    expect(resolveBootstrapEnvironment(undefined, 'test')).toEqual({
      appEnv: 'test',
      nodeEnv: 'test',
    });
  });

  it('should accept compatible APP_ENV and NODE_ENV values', () => {
    expect(resolveBootstrapEnvironment('production', 'production')).toEqual({
      appEnv: 'production',
      nodeEnv: 'production',
    });
  });

  it('should throw when APP_ENV and NODE_ENV are incompatible', () => {
    expect(() => resolveBootstrapEnvironment('test', 'production')).toThrow(
      'Incompatible environment values',
    );
  });

  it('should throw when APP_ENV is invalid even if NODE_ENV is valid', () => {
    expect(() => resolveBootstrapEnvironment('stagng', 'production')).toThrow(
      'Invalid APP_ENV value',
    );
  });

  it('should throw when NODE_ENV is invalid even if APP_ENV is valid', () => {
    expect(() => resolveBootstrapEnvironment('production', 'prod')).toThrow(
      'Invalid NODE_ENV value',
    );
  });
});

describe('resolveEnvFilePaths', () => {
  it('should return development env file priority', () => {
    expect(resolveEnvFilePaths('development')).toEqual([
      '.env.development.local',
      '.env.development',
      '.env.local',
      '.env',
    ]);
  });

  it('should return test env file priority', () => {
    expect(resolveEnvFilePaths('test')).toEqual([
      '.env.test.local',
      '.env.test',
      '.env.local',
      '.env',
    ]);
  });

  it('should return staging env file priority', () => {
    expect(resolveEnvFilePaths('staging')).toEqual([
      '.env.staging.local',
      '.env.staging',
      '.env.local',
      '.env',
    ]);
  });

  it('should return no env files for production', () => {
    expect(resolveEnvFilePaths('production')).toEqual([]);
  });
});

describe('shouldIgnoreEnvFile', () => {
  it('should return true in production', () => {
    expect(shouldIgnoreEnvFile('production')).toBe(true);
  });

  it('should return false outside production', () => {
    expect(shouldIgnoreEnvFile('development')).toBe(false);
  });
});

describe('buildBootstrapEnvironmentConfig', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('should resolve and persist APP_ENV/NODE_ENV into process.env', () => {
    process.env.APP_ENV = 'staging';
    delete process.env.NODE_ENV;

    const result = buildBootstrapEnvironmentConfig();

    expect(result).toEqual({
      appEnv: 'staging',
      nodeEnv: 'production',
      envFilePaths: [
        '.env.staging.local',
        '.env.staging',
        '.env.local',
        '.env',
      ],
      ignoreEnvFile: false,
    });

    expect(process.env.APP_ENV).toBe('staging');
    expect(process.env.NODE_ENV).toBe('production');
  });
});
