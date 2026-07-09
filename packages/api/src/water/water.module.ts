import { WATER_CONFIG, WATER_PROVIDERS } from './water.constants';

import { HubeauWaterQualityProvider } from './providers/hubeau-water-quality.provider';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WaterController } from './controllers/water.controller';
import { WaterMeasurementCacheService } from './services/water-measurement-cache.service';
import { WaterMeasurementOrmEntity } from './entities/water-measurement.orm.entity';
import { WaterService } from './services/water.service';
import { waterConfig } from '../config/water.config';

@Module({
  imports: [TypeOrmModule.forFeature([WaterMeasurementOrmEntity])],
  controllers: [WaterController],
  providers: [
    HubeauWaterQualityProvider,
    WaterMeasurementCacheService,
    WaterService,
    {
      provide: WATER_CONFIG,
      useFactory: () => waterConfig(),
    },
    {
      provide: WATER_PROVIDERS,
      useFactory: (hubeauProvider: HubeauWaterQualityProvider) => [
        hubeauProvider,
      ],
      inject: [HubeauWaterQualityProvider],
    },
  ],
  exports: [WaterService],
})
export class WaterModule {}
