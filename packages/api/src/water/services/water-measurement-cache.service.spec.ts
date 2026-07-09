import { DataSource, Repository } from 'typeorm';

import { WaterMeasurementCacheService } from './water-measurement-cache.service';
import { WaterMeasurementOrmEntity } from '../entities/water-measurement.orm.entity';
import { WaterSample } from '../domain/ports/water-quality-provider.port';

const sample = (overrides: Partial<WaterSample> = {}): WaterSample => ({
  parameterLabel: 'Calcium',
  numericResult: 50,
  conformity: 'C',
  parameterCode: '1374',
  datePrelevement: '2024-03-15',
  codePrelevement: 'P-1',
  ...overrides,
});

describe('WaterMeasurementCacheService', () => {
  let dataSource: DataSource;
  let repo: Repository<WaterMeasurementOrmEntity>;
  let service: WaterMeasurementCacheService;

  beforeAll(async () => {
    dataSource = new DataSource({
      type: 'better-sqlite3',
      database: ':memory:',
      entities: [WaterMeasurementOrmEntity],
      synchronize: true,
    });
    await dataSource.initialize();
    repo = dataSource.getRepository(WaterMeasurementOrmEntity);
    service = new WaterMeasurementCacheService(repo);
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  beforeEach(async () => {
    await repo.clear();
  });

  it('happy: appends samples and reads them back as WaterSamples, most recent first', async () => {
    await service.appendMeasurements('R-1', [
      sample({ datePrelevement: '2024-02-01', codePrelevement: 'P-1' }),
      sample({
        parameterLabel: 'Magnésium',
        parameterCode: '1372',
        numericResult: 8,
        datePrelevement: '2024-09-10',
        codePrelevement: 'P-2',
      }),
    ]);

    const read = await service.readSamples({
      networkCode: 'R-1',
      year: 2024,
      limit: 100,
    });

    expect(read).toHaveLength(2);
    // Ordered by date DESC → the September sample comes first.
    expect(read[0]).toEqual({
      parameterLabel: 'Magnésium',
      numericResult: 8,
      conformity: 'C',
      parameterCode: '1372',
      datePrelevement: '2024-09-10',
      codePrelevement: 'P-2',
    });
    expect(read[1].datePrelevement).toBe('2024-02-01');
  });

  it('idempotent: re-appending the same window inserts no duplicate (INSERT OR IGNORE)', async () => {
    const rows = [
      sample({ datePrelevement: '2024-03-15', codePrelevement: 'P-1' }),
      sample({
        parameterCode: '1372',
        datePrelevement: '2024-03-15',
        codePrelevement: 'P-1',
      }),
    ];
    await service.appendMeasurements('R-1', rows);
    await service.appendMeasurements('R-1', rows);

    expect(await repo.count()).toBe(2);
  });

  it('edge: skips samples missing any part of the unique key', async () => {
    await service.appendMeasurements('R-1', [
      sample({ parameterCode: null }),
      sample({ datePrelevement: null }),
      sample({ codePrelevement: null }),
      sample({ codePrelevement: 'P-KEEP' }), // the only fully-keyed row
    ]);

    expect(await repo.count()).toBe(1);
    const read = await service.readSamples({
      networkCode: 'R-1',
      year: 2024,
      limit: 100,
    });
    expect(read).toHaveLength(1);
    expect(read[0].codePrelevement).toBe('P-KEEP');
  });

  it('getStoredMaxDate: returns the newest stored date for the network + year', async () => {
    await service.appendMeasurements('R-1', [
      sample({ datePrelevement: '2024-01-05', codePrelevement: 'P-1' }),
      sample({
        parameterCode: '1372',
        datePrelevement: '2024-08-22',
        codePrelevement: 'P-2',
      }),
    ]);

    await expect(
      service.getStoredMaxDate({ networkCode: 'R-1', year: 2024 }),
    ).resolves.toBe('2024-08-22');
  });

  it('getStoredMaxDate: returns null when nothing is stored for the network + year', async () => {
    await service.appendMeasurements('R-1', [
      sample({ datePrelevement: '2023-05-05', codePrelevement: 'P-OLD' }),
    ]);

    // Same network, different year → out of window.
    await expect(
      service.getStoredMaxDate({ networkCode: 'R-1', year: 2024 }),
    ).resolves.toBeNull();
    // Different network → out of scope.
    await expect(
      service.getStoredMaxDate({ networkCode: 'R-2', year: 2023 }),
    ).resolves.toBeNull();
  });

  it('readSamples: filters by network and year window', async () => {
    await service.appendMeasurements('R-1', [
      sample({ datePrelevement: '2024-04-04', codePrelevement: 'IN' }),
      sample({
        parameterCode: '1372',
        datePrelevement: '2023-12-31',
        codePrelevement: 'PREV-YEAR',
      }),
    ]);
    await service.appendMeasurements('R-2', [
      sample({ datePrelevement: '2024-04-04', codePrelevement: 'OTHER-NET' }),
    ]);

    const read = await service.readSamples({
      networkCode: 'R-1',
      year: 2024,
      limit: 100,
    });

    expect(read).toHaveLength(1);
    expect(read[0].codePrelevement).toBe('IN');
  });

  it('bounds the read to the `limit` newest rows (sampleCount stays comparable as history accretes)', async () => {
    await service.appendMeasurements('R-1', [
      sample({ datePrelevement: '2024-01-01', codePrelevement: 'OLD' }),
      sample({
        parameterCode: '1372',
        datePrelevement: '2024-05-01',
        codePrelevement: 'MID',
      }),
      sample({
        parameterCode: '1337',
        datePrelevement: '2024-09-01',
        codePrelevement: 'NEW',
      }),
    ]);

    const read = await service.readSamples({
      networkCode: 'R-1',
      year: 2024,
      limit: 2,
    });

    expect(read.map((s) => s.codePrelevement)).toEqual(['NEW', 'MID']);
  });

  it('includes the inclusive year boundaries (01-01 and 12-31)', async () => {
    await service.appendMeasurements('R-1', [
      sample({ datePrelevement: '2024-01-01', codePrelevement: 'JAN1' }),
      sample({
        parameterCode: '1372',
        datePrelevement: '2024-12-31',
        codePrelevement: 'DEC31',
      }),
    ]);

    const read = await service.readSamples({
      networkCode: 'R-1',
      year: 2024,
      limit: 100,
    });
    expect(read.map((s) => s.codePrelevement).sort()).toEqual([
      'DEC31',
      'JAN1',
    ]);
    await expect(
      service.getStoredMaxDate({ networkCode: 'R-1', year: 2024 }),
    ).resolves.toBe('2024-12-31');
  });

  it('edge: appending an empty list is a no-op', async () => {
    await service.appendMeasurements('R-1', []);
    expect(await repo.count()).toBe(0);
  });
});
