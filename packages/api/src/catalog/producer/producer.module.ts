import { Module } from '@nestjs/common';
import { ProducerController } from './controllers/producer.controller';
import { ProducerOrmEntity } from './entities/producer.orm.entity';
import { ProducerService } from './services/producer.service';
import { TypeOrmModule } from '@nestjs/typeorm';

/**
 * Class name `ProducerCatalogModule` (suffixed `*CatalogModule`)
 * to stay consistent with `WaterCatalogModule`,
 * `EquipmentCatalogModule`, `MiscCatalogModule` and to leave
 * room for a future user-side `ProducerModule` (e.g. boutique
 * partner integrations) without class-name collision.
 */
@Module({
  imports: [TypeOrmModule.forFeature([ProducerOrmEntity])],
  controllers: [ProducerController],
  providers: [ProducerService],
  exports: [ProducerService],
})
export class ProducerCatalogModule {}
