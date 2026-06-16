import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { HealthStatusDto } from './dtos/health-status.dto';

/**
 * Health Controller
 *
 * Public, unauthenticated liveness probe. `GET /health` returns 200 for as
 * long as the HTTP process is up. It performs NO database or downstream
 * dependency check — that would be a readiness probe, not liveness.
 *
 * The Docker HEALTHCHECK targets this route instead of the incidental root
 * `/`, so container liveness no longer depends on a business/boilerplate
 * route that could disappear.
 *
 * Not throttled: throttling in this API is opt-in per controller via
 * `@UseGuards(ThrottlerGuard)`, which this controller deliberately omits so
 * the orchestrator's probes are never rate-limited.
 */
@ApiTags('Health')
@Controller('health')
export class HealthController {
  @Get()
  @ApiOperation({ summary: 'Liveness probe — 200 while the process is up' })
  @ApiOkResponse({ type: HealthStatusDto })
  live(): HealthStatusDto {
    return { status: 'ok' };
  }
}
