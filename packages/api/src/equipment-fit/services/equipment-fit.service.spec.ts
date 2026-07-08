import { NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';

import { EquipmentProfileService } from '../../equipment/services/equipment-profile.service';
import { RecipeWaterOrmEntity } from '../../recipe/entities/recipe-water.orm.entity';
import { RecipeService } from '../../recipe/services/recipe.service';
import {
  FermenterReason,
  FermenterVerdict,
  KettleReason,
  KettleVerdict,
} from '../domain/enums/capacity-verdict.enum';
import { EquipmentFitService } from './equipment-fit.service';

type RecipeServiceMock = { getReadableById: jest.Mock };
type EquipmentServiceMock = { getMineById: jest.Mock; listMine: jest.Mock };
type WaterRepoMock = { findOne: jest.Mock };

const USER = 'user-1';
const RECIPE = 'recipe-1';

const profile = { fermenter_volume_l: 5, boil_kettle_volume_l: 10 };
const waterRow = { mash_volume_l: 3, sparge_volume_l: 2 };

function build(): {
  service: EquipmentFitService;
  recipe: RecipeServiceMock;
  equip: EquipmentServiceMock;
  water: WaterRepoMock;
} {
  const recipe: RecipeServiceMock = {
    getReadableById: jest.fn().mockResolvedValue({ batch_size_l: 4.3 }),
  };
  const equip: EquipmentServiceMock = {
    getMineById: jest.fn().mockResolvedValue(profile),
    listMine: jest.fn().mockResolvedValue([profile]),
  };
  const water: WaterRepoMock = {
    findOne: jest.fn().mockResolvedValue(waterRow),
  };
  const service = new EquipmentFitService(
    recipe as unknown as RecipeService,
    equip as unknown as EquipmentProfileService,
    water as unknown as Repository<RecipeWaterOrmEntity>,
  );
  return { service, recipe, equip, water };
}

describe('EquipmentFitService', () => {
  afterEach(() => jest.clearAllMocks());

  it('checks recipe access, resolves the default profile, and returns a FITS verdict', async () => {
    const { service, recipe, equip, water } = build();

    const fit = await service.getFit(USER, RECIPE);

    expect(recipe.getReadableById).toHaveBeenCalledWith(USER, RECIPE);
    expect(equip.listMine).toHaveBeenCalledWith(USER);
    expect(equip.getMineById).not.toHaveBeenCalled();
    expect(water.findOne).toHaveBeenCalledWith({
      where: { recipe_id: RECIPE },
    });
    expect(fit.fermenter).toBe(FermenterVerdict.FITS);
    expect(fit.kettle).toBe(KettleVerdict.OK);
    expect(fit.recipeVolumeL).toBe(4.3);
  });

  it('uses the explicit profileId (getMineById), not the list', async () => {
    const { service, equip } = build();

    await service.getFit(USER, RECIPE, 'profile-9');

    expect(equip.getMineById).toHaveBeenCalledWith(USER, 'profile-9');
    expect(equip.listMine).not.toHaveBeenCalled();
  });

  it('picks the most-recently-created profile when several exist (listMine[0])', async () => {
    const { service, equip } = build();
    equip.listMine.mockResolvedValue([
      { fermenter_volume_l: 30, boil_kettle_volume_l: 40 }, // most recent
      profile,
    ]);

    const fit = await service.getFit(USER, RECIPE);

    // usable = 30 * 0.9 = 27 → still FITS, but usable reflects the first profile.
    expect(fit.fermenterUsableL).toBe(27);
  });

  it('returns NO_PROFILE (non-blocking) when the caller has declared none', async () => {
    const { service, equip } = build();
    equip.listMine.mockResolvedValue([]);

    const fit = await service.getFit(USER, RECIPE);

    expect(fit.fermenter).toBe(FermenterVerdict.NOT_EVALUATED);
    expect(fit.fermenterReason).toBe(FermenterReason.NO_PROFILE);
    expect(fit.kettleReason).toBe(KettleReason.NO_PROFILE);
  });

  it('maps a missing water row to a NO_RECIPE_WATER kettle verdict', async () => {
    const { service, water } = build();
    water.findOne.mockResolvedValue(null);

    const fit = await service.getFit(USER, RECIPE);

    expect(fit.kettle).toBe(KettleVerdict.NOT_EVALUATED);
    expect(fit.kettleReason).toBe(KettleReason.NO_RECIPE_WATER);
    expect(fit.fermenter).toBe(FermenterVerdict.FITS); // fermenter still runs
  });

  it('propagates a NotFound from the recipe access check (unreadable/missing recipe)', async () => {
    const { service, recipe } = build();
    recipe.getReadableById.mockRejectedValue(new NotFoundException());

    await expect(service.getFit(USER, RECIPE)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
