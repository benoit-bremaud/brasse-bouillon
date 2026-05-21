import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FeedbackController } from './controllers/feedback.controller';
import { Feedback } from './entities/feedback.entity';
import { FeedbackService } from './services/feedback.service';
import { IsValidSubCategoryConstraint } from './validators/is-valid-sub-category.validator';

/**
 * Feedback Module (epic #1026, C2 / #1027)
 *
 * Registers the public `POST /feedback` endpoint, its persistence, and
 * the sub-category pairing validator. No backend consent dependency at
 * v0.1 (ADR-0003 keeps consent client-side; backend sync is v0.2).
 */
@Module({
  imports: [TypeOrmModule.forFeature([Feedback])],
  controllers: [FeedbackController],
  providers: [FeedbackService, IsValidSubCategoryConstraint],
})
export class FeedbackModule {}
