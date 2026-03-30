import { EquipmentProfileDomainService } from './services/equipment-profile-domain.service';
import { EquipmentSystemType } from './enums/equipment-system-type.enum';
import { EquipmentProfile } from './entities/equipment-profile.entity';

describe('EquipmentProfileDomainService', () => {
  const fixedDate = new Date('2026-01-30T12:00:00.000Z');
  const now = () => fixedDate;

  let service: EquipmentProfileDomainService;

  beforeEach(() => {
    service = new EquipmentProfileDomainService(now);
  });

  it('should create a valid equipment profile with timestamps', () => {
    const profile = service.createProfile({
      id: 'equip-1',
      ownerId: 'user-1',
      name: '20L All-Grain System',
      mashTunVolumeL: 25,
      boilKettleVolumeL: 25,
      fermenterVolumeL: 23,
      trubLossL: 1,
      deadSpaceLossL: 0.5,
      transferLossL: 0.5,
      evaporationRateLPerHour: 3,
      efficiencyEstimatedPercent: 75,
      systemType: EquipmentSystemType.ALL_GRAIN,
    });

    expect(profile).toEqual<EquipmentProfile>({
      id: 'equip-1',
      ownerId: 'user-1',
      name: '20L All-Grain System',
      mashTunVolumeL: 25,
      boilKettleVolumeL: 25,
      fermenterVolumeL: 23,
      trubLossL: 1,
      deadSpaceLossL: 0.5,
      transferLossL: 0.5,
      evaporationRateLPerHour: 3,
      efficiencyEstimatedPercent: 75,
      efficiencyMeasuredPercent: undefined,
      coolingTimeMinutes: undefined,
      coolingFlowRateLPerMinute: undefined,
      systemType: EquipmentSystemType.ALL_GRAIN,
      createdAt: fixedDate,
      updatedAt: fixedDate,
    });
  });

  it('should reject negative volumes and invalid percentages', () => {
    expect(() =>
      service.createProfile({
        id: 'equip-2',
        ownerId: 'user-1',
        name: 'Invalid System',
        mashTunVolumeL: -10,
        boilKettleVolumeL: 20,
        fermenterVolumeL: 20,
        trubLossL: 1,
        deadSpaceLossL: 1,
        transferLossL: 1,
        evaporationRateLPerHour: 3,
        efficiencyEstimatedPercent: 110,
        systemType: EquipmentSystemType.EXTRACT,
      }),
    ).toThrow();
  });
});
