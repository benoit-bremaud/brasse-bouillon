import { JwtAuthGuard } from '../../auth/guards/jwt.guard';
import { User } from '../../user/entities/user.entity';
import { CapacityFit } from '../domain/capacity-fit';
import {
  FermenterVerdict,
  KettleVerdict,
} from '../domain/enums/capacity-verdict.enum';
import { GetEquipmentFitQueryDto } from '../dtos/get-equipment-fit-query.dto';
import { EquipmentFitService } from '../services/equipment-fit.service';
import { EquipmentFitController } from './equipment-fit.controller';

const domainFit: CapacityFit = {
  fermenter: FermenterVerdict.FITS,
  fermenterReason: null,
  kettle: KettleVerdict.OK,
  kettleReason: null,
  fermenterUsableL: 4.5,
  recipeVolumeL: 4.3,
  preBoilL: 5,
  kettleCapacityL: 10,
  scaleRatio: null,
};

describe('EquipmentFitController', () => {
  const getFit = jest.fn();
  const service = { getFit } as unknown as EquipmentFitService;
  const controller = new EquipmentFitController(service);
  const user = { id: 'user-1' } as User;

  afterEach(() => jest.clearAllMocks());

  it('is protected by the JWT auth guard', () => {
    const guards = Reflect.getMetadata(
      '__guards__',
      EquipmentFitController,
    ) as unknown[];
    expect(guards).toContain(JwtAuthGuard);
  });

  it('delegates to the service with the caller id, recipe id, and profileId, and maps the DTO', async () => {
    getFit.mockResolvedValue(domainFit);
    const query: GetEquipmentFitQueryDto = { profileId: 'profile-9' };

    const dto = await controller.getEquipmentFit(user, 'recipe-1', query);

    expect(getFit).toHaveBeenCalledWith('user-1', 'recipe-1', 'profile-9');
    expect(dto.fermenter).toBe(FermenterVerdict.FITS);
    expect(dto.kettle).toBe(KettleVerdict.OK);
    expect(dto.fermenterUsableL).toBe(4.5);
    expect(dto.recipeVolumeL).toBe(4.3);
    expect(dto.scaleRatio).toBeNull();
  });

  it('passes an undefined profileId through when the query omits it', async () => {
    getFit.mockResolvedValue(domainFit);

    await controller.getEquipmentFit(user, 'recipe-1', {});

    expect(getFit).toHaveBeenCalledWith('user-1', 'recipe-1', undefined);
  });
});
