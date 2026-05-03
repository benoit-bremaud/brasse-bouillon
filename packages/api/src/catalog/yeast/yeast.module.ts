import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { YeastCatalogController } from './controllers/yeast-catalog.controller';
import { YeastCatalogService } from './services/yeast-catalog.service';
import { YeastOrmEntity } from './entities/yeast.orm.entity';

@Module({
  imports: [TypeOrmModule.forFeature([YeastOrmEntity])],
  controllers: [YeastCatalogController],
  providers: [YeastCatalogService],
  exports: [YeastCatalogService],
})
export class YeastModule {}
