import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { FaqBotPrompts } from './faq-bot-prompts';

/**
 * Load the versioned prompt sources co-located with this file. The `.md` files are copied to
 * `dist/faq-bot/prompts/` at build time via the nest-cli `assets` glob, so `__dirname` resolves
 * correctly both under ts-jest (src) and at runtime (dist).
 */
export function loadFaqBotPrompts(): FaqBotPrompts {
  return {
    system: readFileSync(join(__dirname, 'system-prompt.md'), 'utf8'),
    context: readFileSync(join(__dirname, 'context.md'), 'utf8'),
  };
}
