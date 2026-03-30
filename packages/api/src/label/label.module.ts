import { LabelCatalogController } from './controllers/label-catalog.controller';
import { LabelCatalogService } from './services/label-catalog.service';
import { LabelDefaultsController } from './controllers/label-defaults.controller';
import { LabelDefaultsService } from './services/label-defaults.service';
import { LabelDraftController } from './controllers/label-draft.controller';
import { LabelDraftOrmEntity } from './entities/label-draft.orm.entity';
import { LabelDraftService } from './services/label-draft.service';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([LabelDraftOrmEntity])],
  controllers: [
    LabelDraftController,
    LabelCatalogController,
    LabelDefaultsController,
  ],
  providers: [LabelDraftService, LabelCatalogService, LabelDefaultsService],
  exports: [LabelDraftService, LabelCatalogService, LabelDefaultsService],
})
export class LabelModule {}
