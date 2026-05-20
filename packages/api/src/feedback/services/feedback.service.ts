import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateFeedbackDto } from '../dtos/create-feedback.dto';
import { FeedbackResponseDto } from '../dtos/feedback-response.dto';
import { Feedback } from '../entities/feedback.entity';

/**
 * Feedback Service
 *
 * Persists feedback submissions from the website widget and the mobile
 * app. No backend consent gate at v0.1 (consent is client-side per
 * ADR-0003); the service stores what it receives and returns a minimal
 * acknowledgement.
 */
@Injectable()
export class FeedbackService {
  private readonly logger = new Logger(FeedbackService.name);

  constructor(
    @InjectRepository(Feedback)
    private readonly feedbackRepository: Repository<Feedback>,
  ) {}

  /**
   * Persists one feedback submission and returns its acknowledgement.
   *
   * @param dto validated feedback payload mirroring the widget contract
   * @returns the new feedback id, category, sub-category and timestamp
   */
  async create(dto: CreateFeedbackDto): Promise<FeedbackResponseDto> {
    const feedback = this.feedbackRepository.create({
      project_id: dto.projectId,
      category: dto.category,
      sub_category: dto.subCategory ?? null,
      message: dto.message,
      url: dto.url,
      referrer: dto.referrer ?? null,
      user_agent: dto.userAgent,
      viewport_w: dto.viewport.w,
      viewport_h: dto.viewport.h,
      locale: dto.locale,
      client_timestamp: new Date(dto.timestamp),
      widget_version: dto.widgetVersion,
      scroll_depth: dto.scrollDepth,
      session_id: dto.sessionId,
    });

    const saved = await this.feedbackRepository.save(feedback);

    this.logger.log(
      `Feedback ${saved.id} stored (${saved.category}/${saved.sub_category ?? 'none'}) from ${saved.project_id}`,
    );

    return {
      id: saved.id,
      category: saved.category,
      subCategory: saved.sub_category,
      createdAt: saved.created_at,
    };
  }
}
