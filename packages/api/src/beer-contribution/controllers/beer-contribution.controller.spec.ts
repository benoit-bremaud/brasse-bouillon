import { NotImplementedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { BeerContributionController } from './beer-contribution.controller';
import { JwtAuthGuard } from '../../auth/guards/jwt.guard';

describe('BeerContributionController — 501 stubs (Epic #693 part 4/5)', () => {
  let controller: BeerContributionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BeerContributionController],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<BeerContributionController>(
      BeerContributionController,
    );
  });

  describe('POST /beer-contributions', () => {
    it('throws NotImplementedException with a message pointing to v0.2+', () => {
      expect(() => controller.submitContribution()).toThrow(
        NotImplementedException,
      );
      expect(() => controller.submitContribution()).toThrow(/v0\.2\+/);
    });

    it('points to Epic #693 part 4/5 in the message', () => {
      try {
        controller.submitContribution();
        fail('expected NotImplementedException');
      } catch (e) {
        expect((e as Error).message).toMatch(/Epic #693/);
      }
    });
  });

  describe('POST /beer-contributions/:id/approve', () => {
    it('throws NotImplementedException', () => {
      expect(() => controller.approveContribution()).toThrow(
        NotImplementedException,
      );
      expect(() => controller.approveContribution()).toThrow(/v0\.2\+/);
    });

    it('points to Epic #693 part 4/5 in the message', () => {
      try {
        controller.approveContribution();
        fail('expected NotImplementedException');
      } catch (e) {
        expect((e as Error).message).toMatch(/Epic #693/);
      }
    });
  });
});
