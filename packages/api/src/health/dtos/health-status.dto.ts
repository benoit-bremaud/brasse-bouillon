import { ApiProperty } from '@nestjs/swagger';

/**
 * Health Status DTO — the liveness acknowledgement returned by
 * `GET /health`. A constant payload whose only purpose is to confirm the
 * process is up and able to serve HTTP. It carries no database or
 * dependency state on purpose: probing those would make this a readiness
 * check, not a liveness one.
 */
export class HealthStatusDto {
  // Output-only DTO: no class-validator decorators (there is no request body
  // to validate). `readonly` + initializer keeps a constructed instance
  // consistent with the declared literal type.
  @ApiProperty({ example: 'ok' })
  readonly status = 'ok' as const;
}
