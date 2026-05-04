import { EquipmentCatalogController } from './controllers/equipment-catalog.controller';
import { EquipmentCatalogService } from './services/equipment-catalog.service';
import { EquipmentTemplateDistributorOrmEntity } from './entities/equipment-template-distributor.orm.entity';
import { EquipmentTemplateOrmEntity } from './entities/equipment-template.orm.entity';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

/**
 * Renamed `EquipmentCatalogModule` (not `EquipmentModule`) to
 * avoid the class-name collision with the existing top-level
 * `src/equipment/equipment.module.ts:EquipmentModule` (already
 * wired in AppModule for user-owned equipment profiles). Two
 * Nest modules sharing a class name make import resolution and
 * error messages ambiguous; the suffix matches the convention
 * adopted on PR #894 for `WaterCatalogModule`.
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([
      EquipmentTemplateOrmEntity,
      EquipmentTemplateDistributorOrmEntity,
    ]),
  ],
  controllers: [EquipmentCatalogController],
  providers: [EquipmentCatalogService],
  exports: [EquipmentCatalogService],
})
export class EquipmentCatalogModule {}
