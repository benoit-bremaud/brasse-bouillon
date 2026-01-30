import { Injectable } from '@nestjs/common';

/**
 * EquipmentProfileService
 *
 * Application service (use-case layer) for equipment profiles.
 * Persistence and domain orchestration will be added in subsequent commits.
 */
@Injectable()
export class EquipmentProfileService {
  /**
   * Simple ping method to validate module wiring.
   */
  ping(): { ok: true } {
    return { ok: true };
  }
}
