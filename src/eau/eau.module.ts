import { EAU_CONFIG, WATER_PROVIDERS } from './eau.constants';

import { EauController } from './controllers/eau.controller';
import { EauService } from './services/eau.service';
import { HubeauWaterQualityProvider } from './providers/hubeau-water-quality.provider';
import { Module } from '@nestjs/common';
import { eauConfig } from '../config/eau.config';

@Module({
  controllers: [EauController],
  providers: [
    HubeauWaterQualityProvider,
    EauService,
    {
      provide: EAU_CONFIG,
      useFactory: () => eauConfig(),
    },
    {
      provide: WATER_PROVIDERS,
      useFactory: (hubeauProvider: HubeauWaterQualityProvider) => [
        hubeauProvider,
      ],
      inject: [HubeauWaterQualityProvider],
    },
  ],
  exports: [EauService],
})
export class EauModule {}
