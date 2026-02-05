import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { RecipeModule } from '../recipe/recipe.module';

import { BatchController } from './controllers/batch.controller';
import { BatchOrmEntity } from './entities/batch.orm.entity';
import { BatchStepOrmEntity } from './entities/batch-step.orm.entity';
import { BatchService } from './services/batch.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([BatchOrmEntity, BatchStepOrmEntity]),
    RecipeModule,
  ],
  controllers: [BatchController],
  providers: [BatchService],
  exports: [BatchService],
})
export class BatchModule {}
