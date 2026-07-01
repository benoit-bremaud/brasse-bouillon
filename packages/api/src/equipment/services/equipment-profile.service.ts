import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'crypto';
import { QueryFailedError, Repository } from 'typeorm';

import { EquipmentProfileNameTakenException } from '../../common/exceptions';
import { EQUIPMENT_SYSTEM_DEFAULTS } from '../domain/equipment-system-defaults';
import { EquipmentProfileDomainService } from '../domain/services/equipment-profile-domain.service';
import { EquipmentProfileOrmEntity } from '../entities/equipment-profile.orm.entity';
import { CreateEquipmentProfileDto } from '../dtos/create-equipment-profile.dto';
import { UpdateEquipmentProfileDto } from '../dtos/update-equipment-profile.dto';

/**
 * EquipmentProfileService
 *
 * Application service (use-case layer) for equipment profiles.
 * - Owns orchestration (DTO -> ORM mapping)
 * - Enforces ownership (owner_id)
 * - Delegates invariant validation to the pure domain service
 */
@Injectable()
export class EquipmentProfileService {
  private readonly domain = new EquipmentProfileDomainService();

  constructor(
    @InjectRepository(EquipmentProfileOrmEntity)
    private readonly repo: Repository<EquipmentProfileOrmEntity>,
  ) {}

  ping(): { ok: true } {
    return { ok: true };
  }

  async create(
    ownerId: string,
    dto: CreateEquipmentProfileDto,
  ): Promise<EquipmentProfileOrmEntity> {
    // Names are unique per owner (F21). The composite unique index is the
    // durable guarantee; this check produces a clean 409 for the common case.
    await this.assertNameAvailable(ownerId, dto.name);

    const id = randomUUID();

    // The 3-question wizard omits the "hidden" brewing constants; seed them per
    // system type so the novice never has to supply efficiency / boil-off rate.
    const defaults = EQUIPMENT_SYSTEM_DEFAULTS[dto.system_type];

    const entity = this.repo.create({
      id,
      owner_id: ownerId,
      name: dto.name,

      // Mash-tun volume defaults to the boil-kettle volume (single-vessel
      // assumption) when the wizard does not ask for it separately.
      mash_tun_volume_l: dto.mash_tun_volume_l ?? dto.boil_kettle_volume_l,
      boil_kettle_volume_l: dto.boil_kettle_volume_l,
      fermenter_volume_l: dto.fermenter_volume_l,

      trub_loss_l: dto.trub_loss_l ?? 0,
      dead_space_loss_l: dto.dead_space_loss_l ?? 0,
      transfer_loss_l: dto.transfer_loss_l ?? 0,

      evaporation_rate_l_per_hour:
        dto.evaporation_rate_l_per_hour ?? defaults.evaporationRateLPerHour,
      efficiency_estimated_percent:
        dto.efficiency_estimated_percent ?? defaults.efficiencyEstimatedPercent,
      efficiency_measured_percent: dto.efficiency_measured_percent ?? null,

      cooling_time_minutes: dto.cooling_time_minutes ?? null,
      cooling_flow_rate_l_per_minute:
        dto.cooling_flow_rate_l_per_minute ?? null,

      system_type: dto.system_type,
    });

    this.assertValid(ownerId, entity);
    return this.saveOrThrowOnDuplicateName(entity);
  }

  /**
   * Rejects a create when the owner already has a profile with the same name
   * (F21). Throws a 409 EquipmentProfileNameTakenException.
   *
   * The comparison is exact — case- and whitespace-sensitive per the SQLite
   * column collation (no normalisation), matching the unique index.
   */
  private async assertNameAvailable(
    ownerId: string,
    name: string,
  ): Promise<void> {
    const existing = await this.repo.findOne({
      where: { owner_id: ownerId, name },
    });
    if (existing) {
      throw new EquipmentProfileNameTakenException();
    }
  }

  /**
   * Persists an entity, converting the composite unique-index violation on
   * (owner_id, name) into a clean 409 for BOTH create and rename (updateMine)
   * — otherwise the raw QueryFailedError surfaces as a 500.
   */
  private async saveOrThrowOnDuplicateName(
    entity: EquipmentProfileOrmEntity,
  ): Promise<EquipmentProfileOrmEntity> {
    try {
      return await this.repo.save(entity);
    } catch (error) {
      if (this.isDuplicateNameError(error)) {
        throw new EquipmentProfileNameTakenException();
      }
      throw error;
    }
  }

  /**
   * True only for the `(owner_id, name)` composite unique-index violation.
   * SQLite reports it column-qualified as "UNIQUE constraint failed:
   * equipment_profiles.owner_id, equipment_profiles.name" (table.column, not
   * the index name), so match both columns — a primary-key collision or any
   * future unique index on the table is NOT mis-mapped to the name-taken 409.
   */
  private isDuplicateNameError(error: unknown): boolean {
    if (!(error instanceof QueryFailedError)) {
      return false;
    }
    const driver = error.driverError as {
      code?: string | number;
      message?: string;
    };
    const message = (driver.message ?? error.message).toLowerCase();
    return (
      message.includes('equipment_profiles.owner_id') &&
      message.includes('equipment_profiles.name')
    );
  }

  async listMine(ownerId: string): Promise<EquipmentProfileOrmEntity[]> {
    return this.repo.find({
      where: { owner_id: ownerId },
      order: { created_at: 'DESC' },
    });
  }

  async getMineById(
    ownerId: string,
    id: string,
  ): Promise<EquipmentProfileOrmEntity> {
    const entity = await this.repo.findOne({
      where: { id, owner_id: ownerId },
    });
    if (!entity) {
      throw new NotFoundException('Equipment profile not found');
    }
    return entity;
  }

  async updateMine(
    ownerId: string,
    id: string,
    dto: UpdateEquipmentProfileDto,
  ): Promise<EquipmentProfileOrmEntity> {
    const entity = await this.getMineById(ownerId, id);

    if (dto.name !== undefined) entity.name = dto.name;

    if (dto.mash_tun_volume_l !== undefined)
      entity.mash_tun_volume_l = dto.mash_tun_volume_l;
    if (dto.boil_kettle_volume_l !== undefined)
      entity.boil_kettle_volume_l = dto.boil_kettle_volume_l;
    if (dto.fermenter_volume_l !== undefined)
      entity.fermenter_volume_l = dto.fermenter_volume_l;

    if (dto.trub_loss_l !== undefined) entity.trub_loss_l = dto.trub_loss_l;
    if (dto.dead_space_loss_l !== undefined)
      entity.dead_space_loss_l = dto.dead_space_loss_l;
    if (dto.transfer_loss_l !== undefined)
      entity.transfer_loss_l = dto.transfer_loss_l;

    if (dto.evaporation_rate_l_per_hour !== undefined)
      entity.evaporation_rate_l_per_hour = dto.evaporation_rate_l_per_hour;

    if (dto.efficiency_estimated_percent !== undefined)
      entity.efficiency_estimated_percent = dto.efficiency_estimated_percent;

    if (dto.efficiency_measured_percent !== undefined)
      entity.efficiency_measured_percent = dto.efficiency_measured_percent;

    if (dto.cooling_time_minutes !== undefined)
      entity.cooling_time_minutes = dto.cooling_time_minutes;

    if (dto.cooling_flow_rate_l_per_minute !== undefined)
      entity.cooling_flow_rate_l_per_minute =
        dto.cooling_flow_rate_l_per_minute;

    if (dto.system_type !== undefined) entity.system_type = dto.system_type;

    this.assertValid(ownerId, entity);
    // A rename that collides with another of the owner's profiles hits the same
    // unique index — map it to a 409 too (F21), not a 500.
    return this.saveOrThrowOnDuplicateName(entity);
  }

  async deleteMine(ownerId: string, id: string): Promise<{ deleted: true }> {
    const result = await this.repo.delete({ id, owner_id: ownerId });
    if (!result.affected) {
      throw new NotFoundException('Equipment profile not found');
    }
    return { deleted: true };
  }

  /**
   * Validate invariants using the pure domain service.
   * Domain receives camelCase inputs; ORM remains snake_case.
   */
  private assertValid(ownerId: string, e: EquipmentProfileOrmEntity): void {
    this.domain.createProfile({
      id: e.id,
      ownerId,
      name: e.name,

      mashTunVolumeL: e.mash_tun_volume_l,
      boilKettleVolumeL: e.boil_kettle_volume_l,
      fermenterVolumeL: e.fermenter_volume_l,

      trubLossL: e.trub_loss_l,
      deadSpaceLossL: e.dead_space_loss_l,
      transferLossL: e.transfer_loss_l,

      evaporationRateLPerHour: e.evaporation_rate_l_per_hour,
      efficiencyEstimatedPercent: e.efficiency_estimated_percent,
      efficiencyMeasuredPercent: e.efficiency_measured_percent ?? undefined,

      coolingTimeMinutes: e.cooling_time_minutes ?? undefined,
      coolingFlowRateLPerMinute: e.cooling_flow_rate_l_per_minute ?? undefined,

      systemType: e.system_type,
    });
  }
}
