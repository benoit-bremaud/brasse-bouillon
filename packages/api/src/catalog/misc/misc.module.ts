import { MiscCatalogController } from './controllers/misc-catalog.controller';
import { MiscCatalogService } from './services/misc-catalog.service';
import { MiscTemplateOrmEntity } from './entities/misc-template.orm.entity';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

/**
 * Class name `MiscCatalogModule` (suffixed `*CatalogModule`) to
 * stay consistent with `WaterCatalogModule` / `EquipmentCatalog
 * Module` and to leave room for a future user-side `MiscModule`
 * (e.g. recipe-attached miscs) without class-name collision.
 * The convention was adopted on PR #894 for water and confirmed
 * on PR #898 for equipment.
 */
@Module({
  imports: [TypeOrmModule.forFeature([MiscTemplateOrmEntity])],
  controllers: [MiscCatalogController],
  providers: [MiscCatalogService],
  exports: [MiscCatalogService],
})
export class MiscCatalogModule {}
