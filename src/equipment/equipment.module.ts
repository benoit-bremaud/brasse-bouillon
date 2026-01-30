import { Module } from '@nestjs/common';

import { EquipmentProfileController } from './controllers/equipment-profile.controller';
import { EquipmentProfileService } from './services/equipment-profile.service';

/**
 * EquipmentModule
 *
 * Feature module responsible for user equipment profiles.
 * This module will later include:
 * - TypeORM persistence entity and repository wiring
 * - DTO validation
 * - CRUD endpoints (create/list/get/update/delete)
 *
 * For now, it provides a minimal scaffold with a ping endpoint
 * to validate routing and authentication integration.
 */
@Module({
  imports: [],
  controllers: [EquipmentProfileController],
  providers: [EquipmentProfileService],
  exports: [EquipmentProfileService],
})
export class EquipmentModule {}
