import { Module } from '@nestjs/common';

import { AltchaBotCheckAdapter } from './adapters/altcha-bot-check.adapter';
import { MistralLlmAdapter } from './adapters/mistral-llm.adapter';
import { FAQ_BOT_CONFIG, faqBotConfig } from './config/faq-bot.config';
import { FaqBotController } from './faq-bot.controller';
import { FaqBotService } from './faq-bot.service';
import { BotCheckGuard } from './guards/bot-check.guard';
import { FaqBotMetrics } from './metrics/faq-bot.metrics';
import { BOT_CHECK_PORT } from './ports/bot-check.port';
import { LLM_PORT } from './ports/llm.port';
import { FAQ_BOT_PROMPTS, FaqBotPrompts } from './prompts/faq-bot-prompts';
import { loadFaqBotPrompts } from './prompts/load-prompts';

/**
 * Wires the FAQ-bot feature. The DIP bindings are the only place a concrete provider is named:
 * swapping the LLM or the anti-bot = a new adapter + one line here, nothing else changes.
 */
@Module({
  controllers: [FaqBotController],
  providers: [
    FaqBotService,
    FaqBotMetrics,
    BotCheckGuard,
    { provide: FAQ_BOT_CONFIG, useFactory: faqBotConfig },
    {
      provide: FAQ_BOT_PROMPTS,
      useFactory: (): FaqBotPrompts => loadFaqBotPrompts(),
    },
    { provide: LLM_PORT, useClass: MistralLlmAdapter },
    { provide: BOT_CHECK_PORT, useClass: AltchaBotCheckAdapter },
  ],
})
export class FaqBotModule {}
