import { ThrottlerModule } from '@nestjs/throttler';
import { Test } from '@nestjs/testing';

import { FAQ_BOT_CONFIG, type FaqBotConfig } from './config/faq-bot.config';
import { FaqBotController } from './faq-bot.controller';
import { FaqBotModule } from './faq-bot.module';
import { FaqBotService } from './faq-bot.service';
import { FAQ_BOT_PROMPTS, type FaqBotPrompts } from './prompts/faq-bot-prompts';

describe('FaqBotModule (wiring)', () => {
  it('compiles and resolves the service, controller, config factory and loaded prompts', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        ThrottlerModule.forRoot([{ ttl: 60_000, limit: 10 }]),
        FaqBotModule,
      ],
    }).compile();

    expect(moduleRef.get(FaqBotService)).toBeInstanceOf(FaqBotService);
    expect(moduleRef.get(FaqBotController)).toBeInstanceOf(FaqBotController);

    const config = moduleRef.get<FaqBotConfig>(FAQ_BOT_CONFIG);
    expect(config.model).toBe('mistral-small-latest');

    const prompts = moduleRef.get<FaqBotPrompts>(FAQ_BOT_PROMPTS);
    expect(prompts.system.length).toBeGreaterThan(0);
    expect(prompts.context.length).toBeGreaterThan(0);
    // Trimmed, to match the runtime contract (`assembleUserTurn` trims the asset).
    expect(prompts.languageDirective.trim().length).toBeGreaterThan(0);

    await moduleRef.close();
  });
});
