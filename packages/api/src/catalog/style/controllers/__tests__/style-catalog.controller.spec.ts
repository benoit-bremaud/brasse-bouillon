import { Test, TestingModule } from '@nestjs/testing';

import { NotFoundException } from '@nestjs/common';
import { StyleCatalogController } from '../style-catalog.controller';
import { StyleCatalogService } from '../../services/style-catalog.service';
import { StyleOrmEntity } from '../../entities/style.orm.entity';
import { StyleType } from '../../domain/enums/style-type.enum';

/**
 * Controller spec for the BJCP style catalogue. Mocks the service
 * layer so the test isolates the HTTP-shape mapping (URL → service
 * call → DTO transform) from the service's database concerns
 * covered in `style-catalog.service.spec.ts`. Service methods are
 * spied via `jest.spyOn` so eslint's
 * `@typescript-eslint/unbound-method` rule does not fire.
 */
describe('StyleCatalogController', () => {
  let controller: StyleCatalogController;
  let service: StyleCatalogService;

  const ID_AMERICAN_IPA = '00000000-0000-4000-9000-300000000006';

  function buildEntity(
    overrides: Partial<StyleOrmEntity> = {},
  ): StyleOrmEntity {
    return {
      id: ID_AMERICAN_IPA,
      name: 'American IPA',
      category: 'IPA',
      category_number: 21,
      style_letter: 'A',
      style_guide: 'BJCP 2021',
      type: StyleType.ALE,
      og_min: 1.056,
      og_max: 1.07,
      fg_min: 1.008,
      fg_max: 1.014,
      ibu_min: 40,
      ibu_max: 70,
      color_ebc_min: 12,
      color_ebc_max: 28,
      carb_min: 2.2,
      carb_max: 2.7,
      abv_min: 5.5,
      abv_max: 7.5,
      notes: 'IPA américaine moderne, déclinaison hop-forward.',
      profile: 'Arôme houblon explosif, amertume marquée.',
      ingredients: 'Pale Ale Malt, houblons américains, US-05.',
      examples: 'Punk IPA, Stone IPA',
      created_at: new Date('2026-05-03T00:00:00.000Z'),
      updated_at: new Date('2026-05-03T00:00:00.000Z'),
      ...overrides,
    };
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StyleCatalogController],
      providers: [
        {
          provide: StyleCatalogService,
          useValue: {
            list: jest.fn(),
            getById: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get(StyleCatalogController);
    service = module.get(StyleCatalogService);
  });

  describe('GET /catalog/styles', () => {
    it('happy: returns the full list mapped to DTOs', async () => {
      const listSpy = jest.spyOn(service, 'list').mockResolvedValue([
        buildEntity({ id: ID_AMERICAN_IPA, name: 'American IPA' }),
        buildEntity({
          id: '00000000-0000-4000-9000-300000000004',
          name: 'Dry Stout (Irish)',
          type: StyleType.ALE,
          style_guide: 'BJCP 1999',
        }),
      ]);

      const result = await controller.list();

      expect(listSpy).toHaveBeenCalledWith({
        type: undefined,
        style_guide: undefined,
      });
      expect(result.map((r) => r.name)).toEqual([
        'American IPA',
        'Dry Stout (Irish)',
      ]);
      // DTO must serialise dates to ISO strings — never raw Date.
      expect(typeof result[0].created_at).toBe('string');
    });

    it('sad: returns [] when the service yields no rows', async () => {
      jest.spyOn(service, 'list').mockResolvedValue([]);

      const result = await controller.list();
      expect(result).toEqual([]);
    });

    it('edge: forwards the type and style_guide query filters to the service', async () => {
      const listSpy = jest.spyOn(service, 'list').mockResolvedValue([]);

      await controller.list(StyleType.LAGER, 'BJCP 2021');

      expect(listSpy).toHaveBeenCalledWith({
        type: StyleType.LAGER,
        style_guide: 'BJCP 2021',
      });
    });
  });

  describe('GET /catalog/styles/:id', () => {
    it('happy: returns the DTO for the matching style', async () => {
      const getByIdSpy = jest
        .spyOn(service, 'getById')
        .mockResolvedValue(buildEntity());

      const result = await controller.getById(ID_AMERICAN_IPA);

      expect(getByIdSpy).toHaveBeenCalledWith(ID_AMERICAN_IPA);
      expect(result.id).toBe(ID_AMERICAN_IPA);
      expect(result.name).toBe('American IPA');
    });

    it('sad: lets a NotFoundException from the service propagate to the HTTP layer', async () => {
      jest
        .spyOn(service, 'getById')
        .mockRejectedValue(
          new NotFoundException('Style catalogue entry not found'),
        );

      await expect(
        controller.getById('00000000-0000-4000-9000-3000000000ff'),
      ).rejects.toThrow(NotFoundException);
    });

    it('edge: never leaks the raw ORM entity (always wraps in DTO)', async () => {
      const entity = buildEntity();
      jest.spyOn(service, 'getById').mockResolvedValue(entity);

      const result = await controller.getById(ID_AMERICAN_IPA);

      expect(result).not.toBe(entity);
      expect(result.constructor.name).toBe('StyleDto');
    });
  });
});
