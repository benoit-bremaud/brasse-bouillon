import { Test, TestingModule } from '@nestjs/testing';

import { HealthController } from './health.controller';

/**
 * Health Controller unit test.
 *
 * Liveness is a constant, dependency-free probe, so the meaningful unit
 * assertion is simply that the handler returns the `{ status: 'ok' }`
 * acknowledgement. There is intentionally no sad path: the endpoint takes
 * no input and touches no database, so it cannot fail while the process is
 * up — the process being down is exactly what the container HEALTHCHECK
 * detects. The HTTP surface (200 envelope, method restriction) is covered
 * in `test/health.e2e-spec.ts`.
 */
describe('HealthController', () => {
  let controller: HealthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
    }).compile();

    controller = module.get<HealthController>(HealthController);
  });

  // Happy path — the liveness handler returns the constant acknowledgement.
  it('returns the ok status acknowledgement', () => {
    expect(controller.live()).toEqual({ status: 'ok' });
  });
});
