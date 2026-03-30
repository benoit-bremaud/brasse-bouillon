const mockNestFactoryCreate = jest.fn();
const mockUseContainer = jest.fn();
const mockSwaggerCreateDocument = jest.fn();
const mockSwaggerSetup = jest.fn();

jest.mock('./app.module', () => ({
  AppModule: class AppModule {},
}));

jest.mock('@nestjs/core', () => ({
  NestFactory: {
    create: mockNestFactoryCreate,
  },
}));

jest.mock('class-validator', () => ({
  useContainer: mockUseContainer,
}));

jest.mock('@nestjs/swagger', () => {
  class DocumentBuilder {
    setTitle(): this {
      return this;
    }

    setDescription(): this {
      return this;
    }

    setVersion(): this {
      return this;
    }

    setContact(): this {
      return this;
    }

    setLicense(): this {
      return this;
    }

    addServer(): this {
      return this;
    }

    addTag(): this {
      return this;
    }

    addBearerAuth(): this {
      return this;
    }

    build(): Record<string, unknown> {
      return { openapi: '3.0.0' };
    }
  }

  return {
    DocumentBuilder,
    SwaggerModule: {
      createDocument: mockSwaggerCreateDocument,
      setup: mockSwaggerSetup,
    },
  };
});

type AppMock = {
  enableCors: jest.Mock;
  select: jest.Mock;
  selectedModule: Record<string, unknown>;
  useGlobalPipes: jest.Mock;
  useGlobalInterceptors: jest.Mock;
  useGlobalFilters: jest.Mock;
  listen: jest.Mock;
};

const createAppMock = (): AppMock => {
  const selectedModule: Record<string, unknown> = {};

  return {
    enableCors: jest.fn(),
    select: jest.fn().mockReturnValue(selectedModule),
    selectedModule,
    useGlobalPipes: jest.fn(),
    useGlobalInterceptors: jest.fn(),
    useGlobalFilters: jest.fn(),
    listen: jest.fn().mockResolvedValue(undefined),
  };
};

const flushAsyncTasks = async (): Promise<void> =>
  new Promise<void>((resolve) => {
    setImmediate(() => resolve());
  });

const loadMainModule = async (): Promise<void> => {
  jest.resetModules();

  jest.isolateModules(() => {
    jest.requireActual('./main');
  });

  await flushAsyncTasks();
};

describe('main bootstrap', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv };

    delete process.env.PORT;
    delete process.env.SWAGGER_ENABLED;
    process.env.NODE_ENV = 'test';

    mockSwaggerCreateDocument.mockReturnValue({ openapi: '3.0.0' });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  test('happy path: enables CORS and listens on default port', async () => {
    const appMock = createAppMock();
    mockNestFactoryCreate.mockResolvedValue(appMock);

    jest.spyOn(console, 'log').mockImplementation(() => undefined);
    jest.spyOn(console, 'error').mockImplementation(() => undefined);

    await loadMainModule();

    expect(appMock.enableCors).toHaveBeenCalledWith({
      origin: true,
      methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    });
    expect(appMock.select).toHaveBeenCalledTimes(1);
    expect(mockUseContainer).toHaveBeenCalledWith(appMock.selectedModule, {
      fallbackOnErrors: true,
    });
    expect(appMock.useGlobalPipes).toHaveBeenCalledTimes(1);
    expect(appMock.useGlobalInterceptors).toHaveBeenCalledTimes(1);
    expect(appMock.useGlobalFilters).toHaveBeenCalledTimes(1);
    expect(appMock.listen).toHaveBeenCalledWith(3000);
    expect(mockSwaggerCreateDocument).toHaveBeenCalledTimes(1);
    expect(mockSwaggerSetup).toHaveBeenCalledTimes(1);
  });

  test('sad path: logs startup error and exits with code 1 when bootstrap fails', async () => {
    const bootstrapError = new Error('bootstrap failed');
    mockNestFactoryCreate.mockRejectedValueOnce(bootstrapError);

    const consoleErrorSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);
    const processExitSpy = jest
      .spyOn(process, 'exit')
      .mockImplementation((() => undefined) as never);

    await loadMainModule();

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      '❌ Failed to bootstrap application:',
      bootstrapError,
    );
    expect(processExitSpy).toHaveBeenCalledWith(1);
  });

  test('edge case: defaults to port 3000 and skips Swagger in production when disabled', async () => {
    process.env.NODE_ENV = 'production';
    process.env.SWAGGER_ENABLED = 'false';
    process.env.PORT = 'invalid-port';

    const appMock = createAppMock();
    mockNestFactoryCreate.mockResolvedValue(appMock);

    jest.spyOn(console, 'log').mockImplementation(() => undefined);
    jest.spyOn(console, 'error').mockImplementation(() => undefined);

    await loadMainModule();

    expect(appMock.listen).toHaveBeenCalledWith(3000);
    expect(mockSwaggerCreateDocument).not.toHaveBeenCalled();
    expect(mockSwaggerSetup).not.toHaveBeenCalled();
  });
});
