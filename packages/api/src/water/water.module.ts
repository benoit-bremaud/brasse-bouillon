import { WATER_CONFIG, WATER_PROVIDERS } from './water.constants';

import { HubeauWaterQualityProvider } from './providers/hubeau-water-quality.provider';
import { Module } from '@nestjs/common';
import { WaterController } from './controllers/water.controller';
import { WaterService } from './services/water.service';
import { waterConfig } from '../config/water.config';

@Module({
  controllers: [WaterController],
  providers: [
    HubeauWaterQualityProvider,
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
