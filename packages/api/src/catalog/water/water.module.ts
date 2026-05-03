import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WaterCatalogController } from './controllers/water-catalog.controller';
import { WaterCatalogService } from './services/water-catalog.service';
import { WaterOrmEntity } from './entities/water.orm.entity';

@Module({
  imports: [TypeOrmModule.forFeature([WaterOrmEntity])],
  controllers: [WaterCatalogController],
  providers: [WaterCatalogService],
  exports: [WaterCatalogService],
})
export class WaterModule {}
