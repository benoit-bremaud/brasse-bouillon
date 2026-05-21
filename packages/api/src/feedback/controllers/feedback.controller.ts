import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
  ApiTooManyRequestsResponse,
} from '@nestjs/swagger';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';

import { CreateFeedbackDto } from '../dtos/create-feedback.dto';
import { FeedbackResponseDto } from '../dtos/feedback-response.dto';
import { FeedbackService } from '../services/feedback.service';

/**
 * Feedback Controller
 *
 * Public, anonymous endpoint — any curious visitor (website or app)
 * can submit feedback without authentication. Intentionally NOT guarded
 * by `JwtAuthGuard`. Rate-limited via `@Throttle` to deter spam.
 */
@ApiTags('Feedback')
@Controller('feedback')
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @ApiOperation({
    summary: 'Submit a piece of feedback (public, anonymous)',
  })
  @ApiCreatedResponse({ type: FeedbackResponseDto })
  @ApiBadRequestResponse({ description: 'Invalid feedback payload' })
  @ApiTooManyRequestsResponse({ description: 'Rate limit exceeded' })
  async submit(@Body() dto: CreateFeedbackDto): Promise<FeedbackResponseDto> {
    return this.feedbackService.create(dto);
  }
}
