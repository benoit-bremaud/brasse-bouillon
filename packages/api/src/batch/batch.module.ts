import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { RecipeModule } from '../recipe/recipe.module';

import { AlertOrmEntity } from './entities/alert.orm.entity';
import { BatchController } from './controllers/batch.controller';
import { BatchReminderOrmEntity } from './entities/batch-reminder.orm.entity';
import { BatchOrmEntity } from './entities/batch.orm.entity';
import { BatchStepOrmEntity } from './entities/batch-step.orm.entity';
import { MeasurementOrmEntity } from './entities/measurement.orm.entity';
import { ObservationOrmEntity } from './entities/observation.orm.entity';
import { TastingOrmEntity } from './entities/tasting.orm.entity';
import { BatchService } from './services/batch.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      BatchOrmEntity,
      BatchStepOrmEntity,
      BatchReminderOrmEntity,
      MeasurementOrmEntity,
      ObservationOrmEntity,
      AlertOrmEntity,
      TastingOrmEntity,
    ]),
    RecipeModule,
  ],
  controllers: [BatchController],
  providers: [BatchService],
  exports: [BatchService],
})
export class BatchModule {}
