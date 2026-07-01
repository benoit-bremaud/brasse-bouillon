import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiServiceUnavailableResponse,
  ApiTags,
  ApiTooManyRequestsResponse,
} from '@nestjs/swagger';
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
@ApiTags('FaqBot')
@Controller('faq-bot')
export class FaqBotController {
  constructor(private readonly service: FaqBotService) {}

  @Post('ask')
  @HttpCode(HttpStatus.OK)
  @UseGuards(ThrottlerGuard, BotCheckGuard)
  @Throttle({ default: { limit: ASK_LIMIT, ttl: ASK_TTL_MS } })
  @ApiOperation({
    summary:
      'Ask the public FAQ chatbot a question about the Brasse-Bouillon project',
  })
  @ApiOkResponse({
    type: AnswerDto,
    description: 'The chatbot answer (single block, no history)',
  })
  @ApiBadRequestResponse({
    description: 'Empty/too-long question, or missing anti-bot payload',
  })
  @ApiForbiddenResponse({ description: 'Invalid anti-bot (ALTCHA) solution' })
  @ApiTooManyRequestsResponse({
    description: 'Rate limit exceeded for this IP',
  })
  @ApiServiceUnavailableResponse({
    description: 'Chatbot disabled (kill-switch) or monthly budget reached',
  })
  async ask(@Body() dto: AskQuestionDto): Promise<AnswerDto> {
    return this.service.ask(dto.question);
  }

  @Get('challenge')
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: ASK_LIMIT, ttl: ASK_TTL_MS } })
  @ApiOperation({
    summary: 'Issue an anti-bot (ALTCHA) challenge for the widget to solve',
  })
  @ApiOkResponse({ description: 'A fresh ALTCHA proof-of-work challenge' })
  @ApiTooManyRequestsResponse({
    description: 'Rate limit exceeded for this IP',
  })
  async challenge(): Promise<BotChallenge> {
    return this.service.issueChallenge();
  }
}
