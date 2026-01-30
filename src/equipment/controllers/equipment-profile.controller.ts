import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard } from '../../auth/guards/jwt.guard';
import { EquipmentProfileService } from '../services/equipment-profile.service';

/**
 * EquipmentProfileController
 *
 * HTTP controller for equipment profile endpoints.
 * Route prefix: /equipment-profiles
 *
 * NOTE: For now this controller exposes only a ping endpoint to ensure:
 * - module wiring is correct
 * - route is reachable
 * - JWT guard integration works
 */
@ApiTags('Equipment')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('equipment-profiles')
export class EquipmentProfileController {
  constructor(private readonly service: EquipmentProfileService) {}

  /**
   * GET /equipment-profiles/ping
   *
   * Health-style endpoint for this feature (JWT-protected).
   */
  @Get('ping')
  @ApiOperation({ summary: 'Ping equipment module (JWT protected)' })
  @ApiResponse({ status: 200, description: 'Equipment module is reachable' })
  ping(): { ok: true } {
    return this.service.ping();
  }
}
