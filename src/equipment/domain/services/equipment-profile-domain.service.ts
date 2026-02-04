import {
  EquipmentProfile,
  EquipmentProfileId,
  UserId,
} from '../entities/equipment-profile.entity';
import { EquipmentSystemType } from '../enums/equipment-system-type.enum';

export interface CreateEquipmentProfileInput {
  id: EquipmentProfileId;
  ownerId: UserId;
  name: string;

  mashTunVolumeL: number;
  boilKettleVolumeL: number;
  fermenterVolumeL: number;

  trubLossL: number;
  deadSpaceLossL: number;
  transferLossL: number;

  evaporationRateLPerHour: number;
  efficiencyEstimatedPercent: number;
  efficiencyMeasuredPercent?: number;

  coolingTimeMinutes?: number;
  coolingFlowRateLPerMinute?: number;

  systemType: EquipmentSystemType;
}

/**
 * Pure domain service for creating and updating equipment profiles.
 *
 * Responsible for enforcing basic invariants such as non-negative volumes
 * and percentage ranges being within [0, 100].
 */
export class EquipmentProfileDomainService {
  constructor(private readonly now: () => Date = () => new Date()) {}

  /**
   * Creates a new equipment profile after validating its fields.
   *
   * @throws Error if validation fails.
   */
  createProfile(input: CreateEquipmentProfileInput): EquipmentProfile {
    this.validateProfileInput(input);

    const createdAt = this.now();

    return {
      id: input.id,
      ownerId: input.ownerId,
      name: input.name,
      mashTunVolumeL: input.mashTunVolumeL,
      boilKettleVolumeL: input.boilKettleVolumeL,
      fermenterVolumeL: input.fermenterVolumeL,
      trubLossL: input.trubLossL,
      deadSpaceLossL: input.deadSpaceLossL,
      transferLossL: input.transferLossL,
      evaporationRateLPerHour: input.evaporationRateLPerHour,
      efficiencyEstimatedPercent: input.efficiencyEstimatedPercent,
      efficiencyMeasuredPercent: input.efficiencyMeasuredPercent,
      coolingTimeMinutes: input.coolingTimeMinutes,
      coolingFlowRateLPerMinute: input.coolingFlowRateLPerMinute,
      systemType: input.systemType,
      createdAt,
      updatedAt: createdAt,
    };
  }

  private validateProfileInput(input: CreateEquipmentProfileInput): void {
    type NonNegativeField =
      | 'mashTunVolumeL'
      | 'boilKettleVolumeL'
      | 'fermenterVolumeL'
      | 'trubLossL'
      | 'deadSpaceLossL'
      | 'transferLossL'
      | 'evaporationRateLPerHour';

    const nonNegativeFields: NonNegativeField[] = [
      'mashTunVolumeL',
      'boilKettleVolumeL',
      'fermenterVolumeL',
      'trubLossL',
      'deadSpaceLossL',
      'transferLossL',
      'evaporationRateLPerHour',
    ];

    for (const field of nonNegativeFields) {
      const value = input[field];
      if (value < 0) {
        throw new Error(`Field "${String(field)}" must be >= 0`);
      }
    }

    this.ensurePercentInRange(
      'efficiencyEstimatedPercent',
      input.efficiencyEstimatedPercent,
    );

    if (typeof input.efficiencyMeasuredPercent === 'number') {
      this.ensurePercentInRange(
        'efficiencyMeasuredPercent',
        input.efficiencyMeasuredPercent,
      );
    }

    if (
      typeof input.coolingTimeMinutes === 'number' &&
      input.coolingTimeMinutes < 0
    ) {
      throw new Error('Field "coolingTimeMinutes" must be >= 0');
    }

    if (
      typeof input.coolingFlowRateLPerMinute === 'number' &&
      input.coolingFlowRateLPerMinute < 0
    ) {
      throw new Error('Field "coolingFlowRateLPerMinute" must be >= 0');
    }
  }

  private ensurePercentInRange(fieldName: string, value: number): void {
    if (value < 0 || value > 100) {
      throw new Error(`Field "${fieldName}" must be between 0 and 100`);
    }
  }
}
