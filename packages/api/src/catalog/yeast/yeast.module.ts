import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { YeastCatalogController } from './controllers/yeast-catalog.controller';
import { YeastCatalogService } from './services/yeast-catalog.service';
import { YeastDistributorOrmEntity } from './entities/yeast-distributor.orm.entity';
import { YeastOrmEntity } from './entities/yeast.orm.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([YeastOrmEntity, YeastDistributorOrmEntity]),
  ],
  controllers: [YeastCatalogController],
  providers: [YeastCatalogService],
  exports: [YeastCatalogService],
})
export class YeastModule {}
