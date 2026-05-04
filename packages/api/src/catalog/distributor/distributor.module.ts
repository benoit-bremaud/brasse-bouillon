import { DistributorCatalogController } from './controllers/distributor-catalog.controller';
import { DistributorCatalogService } from './services/distributor-catalog.service';
import { DistributorOrmEntity } from './entities/distributor.orm.entity';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

/**
 * Class names follow the `*Catalog{Module|Service|Controller}`
 * convention adopted on PR #894 (water) and confirmed across
 * the rest of the catalogue series. Distributor itself is the
 * 9th catalogue under this convention.
 *
 * The 5 junction entities (`HopDistributorOrmEntity`, etc.)
 * are NOT registered here — they live in their respective
 * catalogue modules so each catalogue keeps ownership of its
 * own data. This module exposes only the distributor surface
 * itself.
 */
@Module({
  imports: [TypeOrmModule.forFeature([DistributorOrmEntity])],
  controllers: [DistributorCatalogController],
  providers: [DistributorCatalogService],
  exports: [DistributorCatalogService],
})
export class DistributorCatalogModule {}
