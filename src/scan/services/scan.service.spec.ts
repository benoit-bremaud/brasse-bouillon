import { BadRequestException, NotFoundException } from '@nestjs/common';
import { QueryFailedError, Repository } from 'typeorm';

import { ScanFermentationType } from '../domain/enums/scan-fermentation-type.enum';
import { ScanImageFace } from '../domain/enums/scan-image-face.enum';
import { ScanRequestStatus } from '../domain/enums/scan-request-status.enum';
import { ScanReviewStatus } from '../domain/enums/scan-review-status.enum';
import { AdminMarkScanReviewNotFoundDto } from '../dtos/admin-mark-scan-review-not-found.dto';
import { AdminResolveScanReviewDto } from '../dtos/admin-resolve-scan-review.dto';
import { ScanCatalogItemOrmEntity } from '../entities/scan-catalog-item.orm.entity';
import { ScanLabelImageOrmEntity } from '../entities/scan-label-image.orm.entity';
import { ScanRequestOrmEntity } from '../entities/scan-request.orm.entity';
import { ScanReviewQueueOrmEntity } from '../entities/scan-review-queue.orm.entity';
import { UploadedImageFile } from '../scan.types';
import { ScanService } from './scan.service';
import { ScanStorageService } from './scan-storage.service';

type RepoMock<T extends object> = {
  findOne: jest.Mock<Promise<T | null>, [unknown]>;
  find: jest.Mock<Promise<T[]>, [unknown]>;
  create: jest.Mock<T, [Partial<T>]>;
  save: jest.Mock<Promise<T>, [T]>;
  count: jest.Mock<Promise<number>, [unknown]>;
};

const createRepoMock = <T extends object>(): RepoMock<T> => ({
  findOne: jest.fn<Promise<T | null>, [unknown]>(),
  find: jest.fn<Promise<T[]>, [unknown]>(),
  create: jest
    .fn<T, [Partial<T>]>()
    .mockImplementation((payload: Partial<T>) => payload as T),
  save: jest.fn<Promise<T>, [T]>(),
  count: jest.fn<Promise<number>, [unknown]>(),
});

const createScanRequest = (
  overrides: Partial<ScanRequestOrmEntity> = {},
): ScanRequestOrmEntity => ({
  id: 'scan-1',
  owner_id: 'owner-1',
  barcode: '3271234567890',
  status: ScanRequestStatus.UNKNOWN_BARCODE,
  idempotency_key: 'idem-key-12345678',
  idempotency_response: '{}',
  consent_ai_training: false,
  retention_until: new Date('2027-01-01T00:00:00.000Z'),
  catalog_item_id: null,
  created_at: new Date('2026-01-01T00:00:00.000Z'),
  updated_at: new Date('2026-01-01T00:00:00.000Z'),
  ...overrides,
});

const createCatalogItem = (
  overrides: Partial<ScanCatalogItemOrmEntity> = {},
): ScanCatalogItemOrmEntity => ({
  id: 'catalog-1',
  barcode: '3271234567890',
  name: 'Amber IPA',
  brewery: 'Brasserie Test',
  style: 'IPA',
  abv: 6.5,
  ibu: 45,
  color_ebc: 25,
  fermentation_type: ScanFermentationType.ALE,
  aromatic_tags: null,
  notes_source: null,
  is_abv_estimated: false,
  is_ibu_estimated: false,
  is_color_ebc_estimated: false,
  is_style_estimated: false,
  created_at: new Date('2026-01-01T00:00:00.000Z'),
  updated_at: new Date('2026-01-01T00:00:00.000Z'),
  ...overrides,
});

const createLabelImage = (
  overrides: Partial<ScanLabelImageOrmEntity> = {},
): ScanLabelImageOrmEntity => ({
  id: 'image-1',
  scan_request_id: 'scan-1',
  face: ScanImageFace.FRONT,
  file_path: 'uploads/scan/owner-1/scan-1/front.jpg',
  mime_type: 'image/jpeg',
  size_bytes: 1024,
  created_at: new Date('2026-01-01T00:00:00.000Z'),
  updated_at: new Date('2026-01-01T00:00:00.000Z'),
  ...overrides,
});

const createReviewQueue = (
  overrides: Partial<ScanReviewQueueOrmEntity> = {},
): ScanReviewQueueOrmEntity => ({
  id: 'review-1',
  scan_request_id: 'scan-1',
  status: ScanReviewStatus.PENDING,
  internal_note: null,
  reviewed_by: null,
  reviewed_at: null,
  created_at: new Date('2026-01-01T00:00:00.000Z'),
  updated_at: new Date('2026-01-01T00:00:00.000Z'),
  ...overrides,
});

describe('ScanService', () => {
  let service: ScanService;
  let scanRequestRepository: RepoMock<ScanRequestOrmEntity>;
  let catalogItemRepository: RepoMock<ScanCatalogItemOrmEntity>;
  let scanLabelImageRepository: RepoMock<ScanLabelImageOrmEntity>;
  let scanReviewQueueRepository: RepoMock<ScanReviewQueueOrmEntity>;
  let scanStorageService: { storeImage: jest.Mock };

  beforeEach(() => {
    scanRequestRepository = createRepoMock<ScanRequestOrmEntity>();
    catalogItemRepository = createRepoMock<ScanCatalogItemOrmEntity>();
    scanLabelImageRepository = createRepoMock<ScanLabelImageOrmEntity>();
    scanReviewQueueRepository = createRepoMock<ScanReviewQueueOrmEntity>();
    scanStorageService = { storeImage: jest.fn() };

    scanRequestRepository.save.mockImplementation((row) =>
      Promise.resolve(row),
    );
    catalogItemRepository.save.mockImplementation((row) =>
      Promise.resolve(row),
    );
    scanLabelImageRepository.save.mockImplementation((row) =>
      Promise.resolve(row),
    );
    scanReviewQueueRepository.save.mockImplementation((row) =>
      Promise.resolve(row),
    );

    scanLabelImageRepository.find.mockResolvedValue([]);
    scanReviewQueueRepository.find.mockResolvedValue([]);

    service = new ScanService(
      scanRequestRepository as unknown as Repository<ScanRequestOrmEntity>,
      catalogItemRepository as unknown as Repository<ScanCatalogItemOrmEntity>,
      scanLabelImageRepository as unknown as Repository<ScanLabelImageOrmEntity>,
      scanReviewQueueRepository as unknown as Repository<ScanReviewQueueOrmEntity>,
      scanStorageService as unknown as ScanStorageService,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('submitBarcode', () => {
    test('happy path: returns cached idempotency response when request already exists', async () => {
      const cachedResponse = {
        id: 'scan-existing',
        owner_id: 'owner-1',
        barcode: '3271234567890',
      };

      scanRequestRepository.findOne.mockResolvedValueOnce(
        createScanRequest({
          idempotency_response: JSON.stringify(cachedResponse),
        }),
      );

      const result = await service.submitBarcode(
        'owner-1',
        'idem-key-12345678',
        {
          barcode: '3271234567890',
        },
      );

      expect(result).toMatchObject(cachedResponse);
      expect(scanRequestRepository.save).not.toHaveBeenCalled();
    });

    test('sad path: throws when idempotency key is invalid', async () => {
      await expect(
        service.submitBarcode('owner-1', 'short', {
          barcode: '3271234567890',
        }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    test('edge case: returns persisted request when unique idempotency constraint happens concurrently', async () => {
      const persistedResponse = {
        id: 'scan-persisted',
        owner_id: 'owner-1',
        barcode: '3271234567890',
      };

      const created = createScanRequest({ idempotency_response: '' });
      const persisted = createScanRequest({
        id: 'scan-persisted',
        idempotency_response: JSON.stringify(persistedResponse),
      });

      const sqliteConstraintError = Object.assign(
        new Error(
          'SQLITE_CONSTRAINT: UNIQUE constraint failed: scan_requests.owner_id, scan_requests.idempotency_key',
        ),
        {
          code: 'SQLITE_CONSTRAINT',
          errno: 19,
        },
      );

      scanRequestRepository.findOne
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(persisted);
      catalogItemRepository.findOne.mockResolvedValueOnce(null);
      scanRequestRepository.create.mockReturnValue(created);
      scanRequestRepository.save.mockRejectedValueOnce(
        new QueryFailedError(
          'INSERT INTO scan_requests VALUES (...)',
          [],
          sqliteConstraintError,
        ),
      );

      const result = await service.submitBarcode(
        'owner-1',
        'idem-key-12345678',
        {
          barcode: '3271234567890',
        },
      );

      expect(scanRequestRepository.findOne).toHaveBeenCalledTimes(2);
      expect(result).toMatchObject(persistedResponse);
    });
  });

  describe('uploadLabelImage', () => {
    const file: UploadedImageFile = {
      buffer: Buffer.from('image-content'),
      mimetype: 'image/jpeg',
      size: 2048,
      originalname: 'front.jpg',
    };

    test('happy path: uploads image and creates pending review queue', async () => {
      const scanRequest = createScanRequest({
        id: 'scan-1',
        owner_id: 'owner-1',
      });

      scanRequestRepository.findOne
        .mockResolvedValueOnce(scanRequest)
        .mockResolvedValueOnce(
          createScanRequest({
            id: 'scan-1',
            owner_id: 'owner-1',
            status: ScanRequestStatus.NEEDS_HUMAN_REVIEW,
          }),
        );

      scanStorageService.storeImage.mockResolvedValue({
        filePath: 'uploads/scan/owner-1/scan-1/front-new.jpg',
        mimeType: 'image/jpeg',
        sizeBytes: 2048,
      });

      scanLabelImageRepository.findOne.mockResolvedValueOnce(null);
      scanLabelImageRepository.create.mockReturnValue(
        createLabelImage({
          file_path: 'uploads/scan/owner-1/scan-1/front-new.jpg',
          size_bytes: 2048,
        }),
      );

      scanReviewQueueRepository.findOne
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(
          createReviewQueue({
            scan_request_id: 'scan-1',
            status: ScanReviewStatus.PENDING,
          }),
        );

      scanReviewQueueRepository.create.mockReturnValue(
        createReviewQueue({ scan_request_id: 'scan-1' }),
      );

      const result = await service.uploadLabelImage(
        'owner-1',
        'scan-1',
        'front',
        file,
      );

      expect(scanLabelImageRepository.save).toHaveBeenCalledTimes(1);
      expect(scanReviewQueueRepository.save).toHaveBeenCalledTimes(1);
      expect(result.status).toBe(ScanRequestStatus.NEEDS_HUMAN_REVIEW);
    });

    test('sad path: throws when file is missing', async () => {
      await expect(
        service.uploadLabelImage(
          'owner-1',
          'scan-1',
          'front',
          undefined as never,
        ),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    test('edge case: rejects invalid face value', async () => {
      scanRequestRepository.findOne.mockResolvedValueOnce(createScanRequest());

      await expect(
        service.uploadLabelImage('owner-1', 'scan-1', 'side', file),
      ).rejects.toBeInstanceOf(BadRequestException);
    });
  });

  describe('adminResolveReview', () => {
    test('happy path: resolves review with existing catalog item', async () => {
      const scanRequest = createScanRequest({ id: 'scan-1' });
      const queue = createReviewQueue({ scan_request_id: 'scan-1' });
      const catalog = createCatalogItem({ id: 'catalog-1' });

      const dto: AdminResolveScanReviewDto = {
        barcode: '3271234567890',
        name: 'Amber IPA',
        brewery: 'Brasserie Test',
        style: 'IPA',
        fermentation_type: ScanFermentationType.ALE,
      };

      scanRequestRepository.findOne.mockResolvedValueOnce(scanRequest);
      scanReviewQueueRepository.findOne
        .mockResolvedValueOnce(queue)
        .mockResolvedValueOnce(
          createReviewQueue({
            scan_request_id: 'scan-1',
            status: ScanReviewStatus.RESOLVED,
            reviewed_by: 'admin-1',
          }),
        );
      catalogItemRepository.findOne
        .mockResolvedValueOnce(catalog)
        .mockResolvedValueOnce(catalog);

      const result = await service.adminResolveReview('admin-1', 'scan-1', dto);

      expect(scanRequestRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          status: ScanRequestStatus.RESOLVED,
          catalog_item_id: 'catalog-1',
        }),
      );
      expect(result.status).toBe(ScanRequestStatus.RESOLVED);
    });

    test('sad path: throws when review queue item is not pending', async () => {
      scanRequestRepository.findOne.mockResolvedValueOnce(
        createScanRequest({ id: 'scan-1' }),
      );
      scanReviewQueueRepository.findOne.mockResolvedValueOnce(
        createReviewQueue({ status: ScanReviewStatus.RESOLVED }),
      );

      await expect(
        service.adminResolveReview('admin-1', 'scan-1', {
          barcode: '3271234567890',
          name: 'Amber IPA',
          brewery: 'Brasserie Test',
          style: 'IPA',
          fermentation_type: ScanFermentationType.ALE,
        }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    test('edge case: creates a new catalog item when barcode is unknown', async () => {
      const scanRequest = createScanRequest({ id: 'scan-1' });
      const queue = createReviewQueue({ scan_request_id: 'scan-1' });

      scanRequestRepository.findOne.mockResolvedValueOnce(scanRequest);
      scanReviewQueueRepository.findOne
        .mockResolvedValueOnce(queue)
        .mockResolvedValueOnce(
          createReviewQueue({
            scan_request_id: 'scan-1',
            status: ScanReviewStatus.RESOLVED,
          }),
        );
      catalogItemRepository.findOne
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(createCatalogItem({ id: 'catalog-new' }));
      catalogItemRepository.create.mockReturnValue(
        createCatalogItem({ id: 'catalog-new' }),
      );

      const result = await service.adminResolveReview('admin-1', 'scan-1', {
        barcode: '3271234567890',
        name: 'Amber IPA',
        brewery: 'Brasserie Test',
        style: 'IPA',
        fermentation_type: ScanFermentationType.ALE,
      });

      expect(catalogItemRepository.create).toHaveBeenCalled();
      expect(result.status).toBe(ScanRequestStatus.RESOLVED);
    });
  });

  describe('adminMarkReviewNotFound', () => {
    test('happy path: marks review as not found and clears catalog_item_id', async () => {
      const scanRequest = createScanRequest({
        id: 'scan-1',
        catalog_item_id: 'catalog-legacy',
      });
      const reviewQueue = createReviewQueue({ scan_request_id: 'scan-1' });
      const dto: AdminMarkScanReviewNotFoundDto = {
        internal_note: 'No trusted match found',
      };

      scanRequestRepository.findOne.mockResolvedValueOnce(scanRequest);
      scanReviewQueueRepository.findOne
        .mockResolvedValueOnce(reviewQueue)
        .mockResolvedValueOnce(
          createReviewQueue({
            scan_request_id: 'scan-1',
            status: ScanReviewStatus.NOT_FOUND,
            reviewed_by: 'admin-1',
          }),
        );

      const result = await service.adminMarkReviewNotFound(
        'admin-1',
        'scan-1',
        dto,
      );

      expect(scanRequestRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          status: ScanRequestStatus.NOT_FOUND,
          catalog_item_id: null,
        }),
      );
      expect(result.catalog_item_id).toBeNull();
      expect(result.status).toBe(ScanRequestStatus.NOT_FOUND);
    });

    test('sad path: throws when scan request does not exist', async () => {
      scanRequestRepository.findOne.mockResolvedValueOnce(null);

      await expect(
        service.adminMarkReviewNotFound('admin-1', 'scan-missing', {}),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    test('edge case: throws when review queue item is missing', async () => {
      scanRequestRepository.findOne.mockResolvedValueOnce(
        createScanRequest({ id: 'scan-1' }),
      );
      scanReviewQueueRepository.findOne.mockResolvedValueOnce(null);

      await expect(
        service.adminMarkReviewNotFound('admin-1', 'scan-1', {}),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });
});
