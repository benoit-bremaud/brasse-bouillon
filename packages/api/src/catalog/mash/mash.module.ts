import { MashCatalogController } from './controllers/mash-catalog.controller';
import { MashCatalogService } from './services/mash-catalog.service';
import { MashProfileOrmEntity } from './entities/mash-profile.orm.entity';
import { MashStepOrmEntity } from './entities/mash-step.orm.entity';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forFeature([MashProfileOrmEntity, MashStepOrmEntity]),
  ],
  controllers: [MashCatalogController],
  providers: [MashCatalogService],
  exports: [MashCatalogService],
})
export class MashModule {}
