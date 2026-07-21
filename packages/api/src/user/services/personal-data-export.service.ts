import { Injectable } from '@nestjs/common';

import { User } from '../entities/user.entity';
import {
  PersonalDataExportAccountDto,
  PersonalDataExportDto,
} from '../dtos/personal-data-export.dto';
import { PersonalDataExportRepository } from '../repositories/personal-data-export.repository';
import { UserService } from './user.service';

const EXPORT_SCHEMA_VERSION = '1.0';

function toAccountExport(user: User): PersonalDataExportAccountDto {
  return {
    id: user.id,
    email: user.email,
    username: user.username,
    first_name: user.first_name ?? null,
    last_name: user.last_name ?? null,
    bio: user.bio ?? null,
    created_at: user.created_at,
    updated_at: user.updated_at,
  };
}

/**
 * Builds the authenticated data-rights export from the API-owned aggregates.
 * Persistence lives entirely in {@link PersonalDataExportRepository}; this
 * service only resolves the account, fans the reads out concurrently, and
 * assembles the DTO. Local-only preferences and consent are merged by the
 * mobile boundary.
 */
@Injectable()
export class PersonalDataExportService {
  constructor(
    private readonly exportRepository: PersonalDataExportRepository,
    private readonly userService: UserService,
  ) {}

  async exportAccount(userId: string): Promise<PersonalDataExportDto> {
    const user = await this.userService.findById(userId);
    const [
      recipes,
      recipeComponents,
      batches,
      batchRecords,
      equipmentProfiles,
      labelDrafts,
      scans,
      scanImages,
    ] = await Promise.all([
      this.exportRepository.findRecipes(userId),
      this.exportRepository.findRecipeComponents(userId),
      this.exportRepository.findBatches(userId),
      this.exportRepository.findBatchRecords(userId),
      this.exportRepository.findEquipmentProfiles(userId),
      this.exportRepository.findLabelDrafts(userId),
      this.exportRepository.findScans(userId),
      this.exportRepository.findScanImages(userId),
    ]);

    return {
      schema_version: EXPORT_SCHEMA_VERSION,
      exported_at: new Date(),
      account: toAccountExport(user),
      recipes,
      recipe_components: recipeComponents,
      batches,
      batch_records: batchRecords,
      equipment_profiles: equipmentProfiles,
      label_drafts: labelDrafts,
      scans,
      scan_images: scanImages,
    };
  }
}
