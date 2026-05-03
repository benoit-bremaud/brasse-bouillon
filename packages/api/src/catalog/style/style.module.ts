import { Module } from '@nestjs/common';
import { StyleCatalogController } from './controllers/style-catalog.controller';
import { StyleCatalogService } from './services/style-catalog.service';
import { StyleOrmEntity } from './entities/style.orm.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([StyleOrmEntity])],
  controllers: [StyleCatalogController],
  providers: [StyleCatalogService],
  exports: [StyleCatalogService],
})
export class StyleModule {}
