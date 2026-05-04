import { FermentableCatalogController } from './controllers/fermentable-catalog.controller';
import { FermentableCatalogService } from './services/fermentable-catalog.service';
import { FermentableDistributorOrmEntity } from './entities/fermentable-distributor.orm.entity';
import { FermentableOrmEntity } from './entities/fermentable.orm.entity';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      FermentableOrmEntity,
      FermentableDistributorOrmEntity,
    ]),
  ],
  controllers: [FermentableCatalogController],
  providers: [FermentableCatalogService],
  exports: [FermentableCatalogService],
})
export class FermentableModule {}
