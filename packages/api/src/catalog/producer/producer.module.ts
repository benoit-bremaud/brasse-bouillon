import { Module } from '@nestjs/common';
import { ProducerCatalogController } from './controllers/producer-catalog.controller';
import { ProducerCatalogService } from './services/producer-catalog.service';
import { ProducerOrmEntity } from './entities/producer.orm.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

/**
 * Class name `ProducerCatalogModule` (suffixed `*CatalogModule`)
 * to stay consistent with `WaterCatalogModule`,
 * `EquipmentCatalogModule`, `MiscCatalogModule` and to leave
 * room for a future user-side `ProducerModule` (e.g. boutique
 * partner integrations) without class-name collision. The
 * controller and service classes follow the same `*Catalog*`
 * suffix pattern (`ProducerCatalogController`,
 * `ProducerCatalogService`) — Copilot caught the inconsistency
 * with the other 8 catalogues on PR #902 review.
 */
@Module({
  imports: [TypeOrmModule.forFeature([ProducerOrmEntity])],
  controllers: [ProducerCatalogController],
  providers: [ProducerCatalogService],
  exports: [ProducerCatalogService],
})
export class ProducerCatalogModule {}
