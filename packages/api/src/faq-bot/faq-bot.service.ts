import { Inject, Injectable } from '@nestjs/common';

import { FAQ_BOT_CONFIG, type FaqBotConfig } from './config/faq-bot.config';
import { FaqBotUnavailableException } from './exceptions/faq-bot-unavailable.exception';
import { FaqBotMetrics } from './metrics/faq-bot.metrics';
import { BOT_CHECK_PORT } from './ports/bot-check.port';
import { LLM_PORT } from './ports/llm.port';
import { FAQ_BOT_PROMPTS } from './prompts/faq-bot-prompts';
import type { AnswerDto } from './dto/answer.dto';
import type { BotChallenge, BotCheckPort } from './ports/bot-check.port';
import type { LlmPort, LlmRequest, LlmResult } from './ports/llm.port';
import type { FaqBotPrompts } from './prompts/faq-bot-prompts';

/** Low creativity — the bot answers factual project questions, not open-ended prose. */
const TEMPERATURE = 0.3;
/** Defense-in-depth cap on returned answer length (on top of `maxAnswerTokens`). */
const MAX_ANSWER_CHARS = 1200;

/**
 * Orchestrates one-shot FAQ answers: enforces the kill-switch/budget gate, assembles
 * system prompt + curated context + the visitor question, calls the `LlmPort`, and maps any
 * provider failure to a graceful `FaqBotUnavailableException`. Depends only on the ports —
 * never on Mistral or ALTCHA directly (DIP, ADR-0022).
 */
@Injectable()
export class FaqBotService {
  constructor(
    @Inject(LLM_PORT) private readonly llm: LlmPort,
    @Inject(BOT_CHECK_PORT) private readonly botCheck: BotCheckPort,
    @Inject(FAQ_BOT_CONFIG) private readonly config: FaqBotConfig,
    @Inject(FAQ_BOT_PROMPTS) private readonly prompts: FaqBotPrompts,
    private readonly metrics: FaqBotMetrics,
  ) {}

  /** Answer a visitor question about the project (one-shot, no history). */
  async ask(question: string): Promise<AnswerDto> {
    this.assertAvailable();

    const request: LlmRequest = {
      system: this.prompts.system,
      user: this.assembleUserTurn(question),
      maxTokens: this.config.maxAnswerTokens,
      temperature: TEMPERATURE,
    };

    let result: LlmResult;
    try {
      result = await this.llm.complete(request);
    } catch {
      this.metrics.recordError();
      throw new FaqBotUnavailableException();
    }

    this.metrics.recordAnswer(result.promptTokens, result.completionTokens);
    return { answer: result.text.trim().slice(0, MAX_ANSWER_CHARS) };
  }

  /** Issue a fresh anti-bot challenge for the widget (delegates to the bot-check port). */
  async issueChallenge(): Promise<BotChallenge> {
    return this.botCheck.issueChallenge();
  }

  /** Kill-switch and best-effort monthly budget gate (ADR-0022). */
  private assertAvailable(): void {
    if (!this.config.enabled) {
      throw new FaqBotUnavailableException(
        'The FAQ chatbot is currently disabled',
      );
    }
    if (this.metrics.estimatedMonthlyEur() >= this.config.monthlyBudgetEur) {
      throw new FaqBotUnavailableException(
        'The FAQ chatbot has reached its monthly budget',
      );
    }
  }

  /** Curated project facts + the visitor question, one-shot (no history in v1). */
  private assembleUserTurn(question: string): string {
    return `Project facts:\n${this.prompts.context}\n\n---\n\nVisitor question:\n${question}`;
  }
}
