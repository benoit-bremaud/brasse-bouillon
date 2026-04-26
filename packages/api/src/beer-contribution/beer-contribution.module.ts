import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';
import { BeerContributionController } from './controllers/beer-contribution.controller';

/**
 * Beer contribution module — 501 stubs only (Epic #693 part 4/5).
 *
 * Hosts the v0.2+ community contribution endpoints in their final
 * shape but with no implementation yet. The module is wired into
 * AppModule so the OpenAPI spec advertises the routes (frontend can
 * code against the contract); each request returns 501 until the
 * feature ships.
 *
 * No service, no repository, no entity — those land alongside the
 * actual implementation in v0.2+. AuthModule is imported so the
 * `JwtAuthGuard` is available on the stub controller.
 */
@Module({
  imports: [AuthModule],
  controllers: [BeerContributionController],
})
export class BeerContributionModule {}
