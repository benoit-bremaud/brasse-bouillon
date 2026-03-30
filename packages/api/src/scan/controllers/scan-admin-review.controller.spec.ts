import { Test, TestingModule } from '@nestjs/testing';

import { AdminMarkScanReviewNotFoundDto } from '../dtos/admin-mark-scan-review-not-found.dto';
import { AdminResolveScanReviewDto } from '../dtos/admin-resolve-scan-review.dto';
import { ScanAdminReviewController } from './scan-admin-review.controller';
import { ScanFermentationType } from '../domain/enums/scan-fermentation-type.enum';
import { ScanRequestDto } from '../dtos/scan-request.dto';
import { ScanService } from '../services/scan.service';
import { User } from '../../user/entities/user.entity';
import { UserRole } from '../../common/enums/role.enum';

describe('ScanAdminReviewController', () => {
  let controller: ScanAdminReviewController;
  let service: ScanService;

  const mockAdmin: User = Object.assign(new User(), {
    id: '550e8400-e29b-41d4-a716-446655440099',
    email: 'admin@example.com',
    username: 'admin',
    password_hash: 'hashed-password',
    first_name: 'Admin',
    last_name: 'User',
    role: UserRole.ADMIN,
    created_at: new Date(),
    updated_at: new Date(),
    is_active: true,
  });

  const scanResponse = { id: 'scan-review-1' } as ScanRequestDto;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ScanAdminReviewController],
      providers: [
        {
          provide: ScanService,
          useValue: {
            listPendingReviewForAdmin: jest.fn(),
            countPendingReviewForAdmin: jest.fn(),
            adminResolveReview: jest.fn(),
            adminMarkReviewNotFound: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ScanAdminReviewController>(
      ScanAdminReviewController,
    );
    service = module.get<ScanService>(ScanService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should list pending review items', async () => {
    const listPendingSpy = jest
      .spyOn(service, 'listPendingReviewForAdmin')
      .mockResolvedValue([scanResponse]);

    const result = await controller.listPending();

    expect(listPendingSpy).toHaveBeenCalled();
    expect(result).toEqual([scanResponse]);
  });

  it('should return pending review count', async () => {
    const countPendingSpy = jest
      .spyOn(service, 'countPendingReviewForAdmin')
      .mockResolvedValue(3);

    const result = await controller.countPending();

    expect(countPendingSpy).toHaveBeenCalled();
    expect(result).toEqual({ pending: 3 });
  });

  it('should resolve a pending review', async () => {
    const dto: AdminResolveScanReviewDto = {
      barcode: '3271234567890',
      name: 'Amber IPA',
      brewery: 'Brasserie Test',
      style: 'IPA',
      fermentation_type: ScanFermentationType.ALE,
    };

    const resolveSpy = jest
      .spyOn(service, 'adminResolveReview')
      .mockResolvedValue(scanResponse);

    const result = await controller.resolve(
      mockAdmin,
      '550e8400-e29b-41d4-a716-446655440001',
      dto,
    );

    expect(resolveSpy).toHaveBeenCalledWith(
      mockAdmin.id,
      '550e8400-e29b-41d4-a716-446655440001',
      dto,
    );
    expect(result).toBe(scanResponse);
  });

  it('should mark a pending review as not found', async () => {
    const dto: AdminMarkScanReviewNotFoundDto = {
      internal_note: 'No reliable match',
    };

    const markNotFoundSpy = jest
      .spyOn(service, 'adminMarkReviewNotFound')
      .mockResolvedValue(scanResponse);

    const result = await controller.markNotFound(
      mockAdmin,
      '550e8400-e29b-41d4-a716-446655440001',
      dto,
    );

    expect(markNotFoundSpy).toHaveBeenCalledWith(
      mockAdmin.id,
      '550e8400-e29b-41d4-a716-446655440001',
      dto,
    );
    expect(result).toBe(scanResponse);
  });
});
