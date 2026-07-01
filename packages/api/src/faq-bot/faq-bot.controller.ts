import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';

import { AnswerDto } from './dto/answer.dto';
import { AskQuestionDto } from './dto/ask-question.dto';
import { FaqBotService } from './faq-bot.service';
import { BotCheckGuard } from './guards/bot-check.guard';
import { BotChallenge } from './ports/bot-check.port';

/** Requests per IP per minute on the paid LLM endpoint (ADR-0022). */
const ASK_LIMIT = 5;
const ASK_TTL_MS = 60_000;

/**
 * Public FAQ-bot HTTP surface.
 *
 * `POST /faq-bot/ask` is anonymous (no auth guard applied — there is no global JWT guard to opt
 * out of), throttled per IP, and gated by the ALTCHA `BotCheckGuard`. `GET /faq-bot/challenge`
 * issues an anti-bot challenge for the widget. Controllers return plain data; the global
 * interceptor wraps the response envelope.
 */
@Controller('faq-bot')
export class FaqBotController {
  constructor(private readonly service: FaqBotService) {}

  @Post('ask')
  @HttpCode(HttpStatus.OK)
  @UseGuards(ThrottlerGuard, BotCheckGuard)
  @Throttle({ default: { limit: ASK_LIMIT, ttl: ASK_TTL_MS } })
  async ask(@Body() dto: AskQuestionDto): Promise<AnswerDto> {
    return this.service.ask(dto.question);
  }

  @Get('challenge')
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: ASK_LIMIT, ttl: ASK_TTL_MS } })
  async challenge(): Promise<BotChallenge> {
    return this.service.issueChallenge();
  }
}
