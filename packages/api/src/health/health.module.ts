import { Module } from '@nestjs/common';

import { HealthController } from './health.controller';

/**
 * Health Module
 *
 * Registers the public `GET /health` liveness probe. No providers and no
 * persistence: the controller returns a constant acknowledgement, so the
 * module has no dependency on DatabaseModule.
 */
@Module({
  controllers: [HealthController],
})
export class HealthModule {}
