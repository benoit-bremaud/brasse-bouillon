import { Test, TestingModule } from '@nestjs/testing';

import { BadRequestException } from '@nestjs/common';
import { ScanController } from './scan.controller';
import { ScanRequestDto } from '../dtos/scan-request.dto';
import { ScanService } from '../services/scan.service';
import { SubmitScanBarcodeDto } from '../dtos/submit-scan-barcode.dto';
import { UploadedImageFile } from '../scan.types';
import { User } from '../../user/entities/user.entity';
import { UserRole } from '../../common/enums/role.enum';

describe('ScanController', () => {
  let controller: ScanController;
  let service: ScanService;

  const mockUser: User = Object.assign(new User(), {
    id: '550e8400-e29b-41d4-a716-446655440000',
    email: 'scan-user@example.com',
    username: 'scan-user',
    password_hash: 'hashed-password',
    first_name: 'Scan',
    last_name: 'User',
    role: UserRole.USER,
    created_at: new Date(),
    updated_at: new Date(),
    is_active: true,
  });

  const scanResponse = { id: 'scan-id-1' } as ScanRequestDto;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ScanController],
      providers: [
        {
          provide: ScanService,
          useValue: {
            submitBarcode: jest.fn(),
            uploadLabelImage: jest.fn(),
            listMine: jest.fn(),
            getMineById: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ScanController>(ScanController);
    service = module.get<ScanService>(ScanService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('submitBarcode()', () => {
    it('should submit barcode with idempotency key', async () => {
      const dto: SubmitScanBarcodeDto = {
        barcode: '3271234567890',
        consent_ai_training: false,
      };

      const submitBarcodeSpy = jest
        .spyOn(service, 'submitBarcode')
        .mockResolvedValue(scanResponse);

      const result = await controller.submitBarcode(
        mockUser,
        'idem-key-123456',
        dto,
      );

      expect(submitBarcodeSpy).toHaveBeenCalledWith(
        mockUser.id,
        'idem-key-123456',
        dto,
      );
      expect(result).toBe(scanResponse);
    });

    it('should throw when idempotency header is missing', async () => {
      const dto: SubmitScanBarcodeDto = {
        barcode: '3271234567890',
      };

      await expect(
        controller.submitBarcode(mockUser, '   ', dto),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('uploadLabelImage()', () => {
    it('should upload label image when file is provided', async () => {
      const file: UploadedImageFile = {
        buffer: Buffer.from('fake-image-content'),
        mimetype: 'image/jpeg',
        size: 1_024,
        originalname: 'label.jpg',
      };

      const uploadLabelImageSpy = jest
        .spyOn(service, 'uploadLabelImage')
        .mockResolvedValue(scanResponse);

      const result = await controller.uploadLabelImage(
        mockUser,
        '550e8400-e29b-41d4-a716-446655440001',
        'front',
        file,
      );

      expect(uploadLabelImageSpy).toHaveBeenCalledWith(
        mockUser.id,
        '550e8400-e29b-41d4-a716-446655440001',
        'front',
        file,
      );
      expect(result).toBe(scanResponse);
    });

    it('should throw when image file is missing', async () => {
      await expect(
        controller.uploadLabelImage(
          mockUser,
          '550e8400-e29b-41d4-a716-446655440001',
          'front',
          undefined,
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('read endpoints', () => {
    it('should list user scans', async () => {
      const listMineSpy = jest
        .spyOn(service, 'listMine')
        .mockResolvedValue([scanResponse]);

      const result = await controller.listMine(mockUser);

      expect(listMineSpy).toHaveBeenCalledWith(mockUser.id);
      expect(result).toEqual([scanResponse]);
    });

    it('should get one scan by id for current user', async () => {
      const getMineByIdSpy = jest
        .spyOn(service, 'getMineById')
        .mockResolvedValue(scanResponse);

      const result = await controller.getMineById(
        mockUser,
        '550e8400-e29b-41d4-a716-446655440001',
      );

      expect(getMineByIdSpy).toHaveBeenCalledWith(
        mockUser.id,
        '550e8400-e29b-41d4-a716-446655440001',
      );
      expect(result).toBe(scanResponse);
    });
  });
});
