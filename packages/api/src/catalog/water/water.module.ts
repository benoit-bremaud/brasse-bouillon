import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WaterCatalogController } from './controllers/water-catalog.controller';
import { WaterCatalogService } from './services/water-catalog.service';
import { WaterOrmEntity } from './entities/water.orm.entity';

/**
 * Renamed `WaterCatalogModule` (not `WaterModule`) to avoid the
 * class-name collision with the existing top-level
 * `src/water/water.module.ts:WaterModule` (already wired in
 * AppModule). Two Nest modules sharing a class name make import
 * resolution and error messages ambiguous; the suffix makes the
 * intent unambiguous at a glance.
 */
@Module({
  imports: [TypeOrmModule.forFeature([WaterOrmEntity])],
  controllers: [WaterCatalogController],
  providers: [WaterCatalogService],
  exports: [WaterCatalogService],
})
export class WaterCatalogModule {}
