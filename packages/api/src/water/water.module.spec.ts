import { WATER_CONFIG, WATER_PROVIDERS } from './water.constants';

import { HubeauWaterQualityProvider } from './providers/hubeau-water-quality.provider';
import { Test } from '@nestjs/testing';
import { WaterConfig } from '../config/water.config';
import { WaterMeasurementOrmEntity } from './entities/water-measurement.orm.entity';
import { WaterModule } from './water.module';
import { WaterService } from './services/water.service';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('WaterModule', () => {
  it('should expose water config and providers tokens', async () => {
    // The append-only cache repository (slice 2) needs a DataSource this unit
    // test does not mount — override it with a fake so DI resolves.
    const moduleRef = await Test.createTestingModule({
      imports: [WaterModule],
    })
      .overrideProvider(getRepositoryToken(WaterMeasurementOrmEntity))
      .useValue({})
      .compile();

    const waterConfig = moduleRef.get<WaterConfig>(WATER_CONFIG);
    const providers = moduleRef.get<unknown[]>(WATER_PROVIDERS);

    expect(waterConfig).toBeDefined();
    expect(providers).toBeDefined();
    expect(Array.isArray(providers)).toBe(true);
    expect(providers).toHaveLength(1);
    expect(providers[0]).toBeInstanceOf(HubeauWaterQualityProvider);

    const waterService = moduleRef.get(WaterService);
    expect(waterService).toBeInstanceOf(WaterService);
  });
});
