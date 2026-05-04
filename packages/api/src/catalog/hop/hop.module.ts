import { HopCatalogController } from './controllers/hop-catalog.controller';
import { HopCatalogService } from './services/hop-catalog.service';
import { HopDistributorOrmEntity } from './entities/hop-distributor.orm.entity';
import { HopOrmEntity } from './entities/hop.orm.entity';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([HopOrmEntity, HopDistributorOrmEntity])],
  controllers: [HopCatalogController],
  providers: [HopCatalogService],
  exports: [HopCatalogService],
})
export class HopModule {}
