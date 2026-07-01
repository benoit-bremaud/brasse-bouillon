import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Inject,
  Injectable,
} from '@nestjs/common';

import { FAQ_BOT_CONFIG, type FaqBotConfig } from '../config/faq-bot.config';
import { BOT_CHECK_PORT, type BotCheckPort } from '../ports/bot-check.port';

/** Request slice the guard reads — the solved ALTCHA payload sits in the body. */
interface BotCheckRequest {
  readonly body?: { readonly altcha?: unknown };
}

/**
 * Verifies the ALTCHA proof-of-work payload on protected routes (via `BotCheckPort`).
 *
 * - **Bypass** when no HMAC secret is configured (dev/CI) — keeps local runs and the unit
 *   suite frictionless (ADR-0022).
 * - When a secret is set: **missing** payload → 400 (malformed request), **invalid** → 403
 *   (verification failed). Messages stay generic (no mechanism details).
 */
@Injectable()
export class BotCheckGuard implements CanActivate {
  constructor(
    @Inject(BOT_CHECK_PORT) private readonly botCheck: BotCheckPort,
    @Inject(FAQ_BOT_CONFIG) private readonly config: FaqBotConfig,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (!this.config.altchaHmacKey) {
      return true;
    }

    const request = context.switchToHttp().getRequest<BotCheckRequest>();
    const payload = request.body?.altcha;
    if (typeof payload !== 'string' || payload.length === 0) {
      throw new BadRequestException('Anti-bot verification required');
    }

    if (!(await this.botCheck.verify(payload))) {
      throw new ForbiddenException('Anti-bot verification failed');
    }
    return true;
  }
}
