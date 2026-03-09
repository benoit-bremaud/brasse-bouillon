import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'crypto';
import { Repository } from 'typeorm';

import { ScanDomainService } from '../domain/services/scan-domain.service';
import { ScanImageFace } from '../domain/enums/scan-image-face.enum';
import { ScanRequestStatus } from '../domain/enums/scan-request-status.enum';
import { ScanReviewStatus } from '../domain/enums/scan-review-status.enum';
import { ScanRequestOrmEntity } from '../entities/scan-request.orm.entity';
import { ScanCatalogItemOrmEntity } from '../entities/scan-catalog-item.orm.entity';
import { ScanLabelImageOrmEntity } from '../entities/scan-label-image.orm.entity';
import { ScanReviewQueueOrmEntity } from '../entities/scan-review-queue.orm.entity';
import { SubmitScanBarcodeDto } from '../dtos/submit-scan-barcode.dto';
import { ScanRequestDto } from '../dtos/scan-request.dto';
import { ScanCatalogItemDto } from '../dtos/scan-catalog-item.dto';
import { ScanReviewQueueDto } from '../dtos/scan-review-queue.dto';
import { ScanLabelImageDto } from '../dtos/scan-label-image.dto';
import { ScanStorageService } from './scan-storage.service';
import { AdminResolveScanReviewDto } from '../dtos/admin-resolve-scan-review.dto';
import { AdminMarkScanReviewNotFoundDto } from '../dtos/admin-mark-scan-review-not-found.dto';
import { UploadedImageFile } from '../scan.types';

@Injectable()
export class ScanService {
  private readonly domainService = new ScanDomainService();

  constructor(
    @InjectRepository(ScanRequestOrmEntity)
    private readonly scanRequestRepository: Repository<ScanRequestOrmEntity>,
    @InjectRepository(ScanCatalogItemOrmEntity)
    private readonly catalogItemRepository: Repository<ScanCatalogItemOrmEntity>,
    @InjectRepository(ScanLabelImageOrmEntity)
    private readonly scanLabelImageRepository: Repository<ScanLabelImageOrmEntity>,
    @InjectRepository(ScanReviewQueueOrmEntity)
    private readonly scanReviewQueueRepository: Repository<ScanReviewQueueOrmEntity>,
    private readonly scanStorageService: ScanStorageService,
  ) {}

  async submitBarcode(
    ownerId: string,
    idempotencyKeyRaw: string,
    dto: SubmitScanBarcodeDto,
  ): Promise<ScanRequestDto> {
    const barcode = this.executeDomainValidation(() =>
      this.domainService.validateBarcode({
        barcode: dto.barcode,
      }),
    );

    const idempotencyKey = this.executeDomainValidation(() =>
      this.domainService.validateIdempotencyKey({
        key: idempotencyKeyRaw,
      }),
    );

    const existingByIdempotency = await this.scanRequestRepository.findOne({
      where: { owner_id: ownerId, idempotency_key: idempotencyKey },
    });

    if (existingByIdempotency) {
      return this.deserializeIdempotencyResponse(existingByIdempotency);
    }

    const existingCatalogItem = await this.catalogItemRepository.findOne({
      where: { barcode },
    });

    const now = new Date();
    const retentionUntil = this.domainService.buildRetentionDate({ from: now });

    const scanRequest = this.scanRequestRepository.create({
      id: randomUUID(),
      owner_id: ownerId,
      barcode,
      status: existingCatalogItem
        ? ScanRequestStatus.MATCHED
        : ScanRequestStatus.UNKNOWN_BARCODE,
      idempotency_key: idempotencyKey,
      idempotency_response: '',
      consent_ai_training: dto.consent_ai_training ?? false,
      retention_until: retentionUntil,
      catalog_item_id: existingCatalogItem?.id ?? null,
    });

    const initialResponse = ScanRequestDto.fromEntity(scanRequest, {
      catalogItem: existingCatalogItem
        ? ScanCatalogItemDto.fromEntity(existingCatalogItem)
        : null,
      reviewQueue: null,
      images: [],
    });

    scanRequest.idempotency_response = JSON.stringify(initialResponse);

    await this.scanRequestRepository.save(scanRequest);

    return initialResponse;
  }

  async uploadLabelImage(
    ownerId: string,
    scanRequestId: string,
    faceRaw: string,
    file: UploadedImageFile,
  ): Promise<ScanRequestDto> {
    if (!file) {
      throw new BadRequestException('Image file is required');
    }

    const scanRequest = await this.scanRequestRepository.findOne({
      where: { id: scanRequestId, owner_id: ownerId },
    });

    if (!scanRequest) {
      throw new NotFoundException('Scan request not found');
    }

    if (scanRequest.status === ScanRequestStatus.MATCHED) {
      throw new BadRequestException(
        'This scan is already matched; label upload is not required',
      );
    }

    const face = this.parseFaceOrThrow(faceRaw);

    this.executeDomainValidation(() =>
      this.domainService.validateImageUpload({
        filesCount: 1,
        face,
        mimeType: file.mimetype,
        sizeBytes: file.size,
      }),
    );

    const storedImage = await this.scanStorageService.storeImage({
      ownerId,
      scanRequestId,
      face,
      file,
    });

    const existingFaceImage = await this.scanLabelImageRepository.findOne({
      where: { scan_request_id: scanRequestId, face },
    });

    if (existingFaceImage) {
      existingFaceImage.file_path = storedImage.filePath;
      existingFaceImage.mime_type = storedImage.mimeType;
      existingFaceImage.size_bytes = storedImage.sizeBytes;
      await this.scanLabelImageRepository.save(existingFaceImage);
    } else {
      const scanLabelImage = this.scanLabelImageRepository.create({
        id: randomUUID(),
        scan_request_id: scanRequest.id,
        face,
        file_path: storedImage.filePath,
        mime_type: storedImage.mimeType,
        size_bytes: storedImage.sizeBytes,
      });
      await this.scanLabelImageRepository.save(scanLabelImage);
    }

    scanRequest.status = ScanRequestStatus.NEEDS_HUMAN_REVIEW;
    await this.scanRequestRepository.save(scanRequest);

    const existingReviewQueue = await this.scanReviewQueueRepository.findOne({
      where: { scan_request_id: scanRequest.id },
    });

    if (!existingReviewQueue) {
      const reviewQueue = this.scanReviewQueueRepository.create({
        id: randomUUID(),
        scan_request_id: scanRequest.id,
        status: ScanReviewStatus.PENDING,
      });
      await this.scanReviewQueueRepository.save(reviewQueue);
    } else if (existingReviewQueue.status !== ScanReviewStatus.PENDING) {
      existingReviewQueue.status = ScanReviewStatus.PENDING;
      existingReviewQueue.reviewed_at = null;
      existingReviewQueue.reviewed_by = null;
      await this.scanReviewQueueRepository.save(existingReviewQueue);
    }

    return this.getMineById(ownerId, scanRequest.id);
  }

  async listMine(ownerId: string): Promise<ScanRequestDto[]> {
    const rows = await this.scanRequestRepository.find({
      where: { owner_id: ownerId },
      order: { created_at: 'DESC' },
    });

    const result: ScanRequestDto[] = [];
    for (const row of rows) {
      result.push(await this.buildScanRequestDto(row));
    }

    return result;
  }

  async getMineById(ownerId: string, id: string): Promise<ScanRequestDto> {
    const scanRequest = await this.scanRequestRepository.findOne({
      where: { id, owner_id: ownerId },
    });

    if (!scanRequest) {
      throw new NotFoundException('Scan request not found');
    }

    return this.buildScanRequestDto(scanRequest);
  }

  async listPendingReviewForAdmin(): Promise<ScanRequestDto[]> {
    const pendingQueueRows = await this.scanReviewQueueRepository.find({
      where: { status: ScanReviewStatus.PENDING },
      order: { created_at: 'ASC' },
    });

    const result: ScanRequestDto[] = [];

    for (const queueRow of pendingQueueRows) {
      const scanRequest = await this.scanRequestRepository.findOne({
        where: { id: queueRow.scan_request_id },
      });
      if (!scanRequest) {
        continue;
      }
      result.push(await this.buildScanRequestDto(scanRequest));
    }

    return result;
  }

  async countPendingReviewForAdmin(): Promise<number> {
    return this.scanReviewQueueRepository.count({
      where: { status: ScanReviewStatus.PENDING },
    });
  }

  async adminResolveReview(
    adminId: string,
    scanRequestId: string,
    dto: AdminResolveScanReviewDto,
  ): Promise<ScanRequestDto> {
    const scanRequest = await this.scanRequestRepository.findOne({
      where: { id: scanRequestId },
    });

    if (!scanRequest) {
      throw new NotFoundException('Scan request not found');
    }

    const reviewQueue = await this.scanReviewQueueRepository.findOne({
      where: { scan_request_id: scanRequest.id },
    });

    if (!reviewQueue) {
      throw new NotFoundException('Review queue item not found');
    }

    if (reviewQueue.status !== ScanReviewStatus.PENDING) {
      throw new BadRequestException('Review item is not pending');
    }

    const barcode = this.executeDomainValidation(() =>
      this.domainService.validateBarcode({
        barcode: dto.barcode,
      }),
    );

    const existingCatalogItem = await this.catalogItemRepository.findOne({
      where: { barcode },
    });

    const catalogItem = existingCatalogItem
      ? existingCatalogItem
      : this.catalogItemRepository.create({ id: randomUUID() });

    catalogItem.barcode = barcode;
    catalogItem.name = dto.name;
    catalogItem.brewery = dto.brewery;
    catalogItem.style = dto.style;
    catalogItem.abv = dto.abv ?? null;
    catalogItem.ibu = dto.ibu ?? null;
    catalogItem.color_ebc = dto.color_ebc ?? null;
    catalogItem.fermentation_type = dto.fermentation_type;
    catalogItem.aromatic_tags = dto.aromatic_tags ?? null;
    catalogItem.notes_source = dto.notes_source ?? null;
    catalogItem.is_abv_estimated = dto.is_abv_estimated ?? false;
    catalogItem.is_ibu_estimated = dto.is_ibu_estimated ?? false;
    catalogItem.is_color_ebc_estimated = dto.is_color_ebc_estimated ?? false;
    catalogItem.is_style_estimated = dto.is_style_estimated ?? false;

    const savedCatalogItem = await this.catalogItemRepository.save(catalogItem);

    scanRequest.status = ScanRequestStatus.RESOLVED;
    scanRequest.catalog_item_id = savedCatalogItem.id;
    await this.scanRequestRepository.save(scanRequest);

    reviewQueue.status = ScanReviewStatus.RESOLVED;
    reviewQueue.reviewed_by = adminId;
    reviewQueue.reviewed_at = new Date();
    reviewQueue.internal_note = dto.internal_note ?? null;
    await this.scanReviewQueueRepository.save(reviewQueue);

    return this.buildScanRequestDto(scanRequest);
  }

  async adminMarkReviewNotFound(
    adminId: string,
    scanRequestId: string,
    dto: AdminMarkScanReviewNotFoundDto,
  ): Promise<ScanRequestDto> {
    const scanRequest = await this.scanRequestRepository.findOne({
      where: { id: scanRequestId },
    });

    if (!scanRequest) {
      throw new NotFoundException('Scan request not found');
    }

    const reviewQueue = await this.scanReviewQueueRepository.findOne({
      where: { scan_request_id: scanRequest.id },
    });

    if (!reviewQueue) {
      throw new NotFoundException('Review queue item not found');
    }

    if (reviewQueue.status !== ScanReviewStatus.PENDING) {
      throw new BadRequestException('Review item is not pending');
    }

    scanRequest.status = ScanRequestStatus.NOT_FOUND;
    await this.scanRequestRepository.save(scanRequest);

    reviewQueue.status = ScanReviewStatus.NOT_FOUND;
    reviewQueue.reviewed_by = adminId;
    reviewQueue.reviewed_at = new Date();
    reviewQueue.internal_note = dto.internal_note ?? null;
    await this.scanReviewQueueRepository.save(reviewQueue);

    return this.buildScanRequestDto(scanRequest);
  }

  private deserializeIdempotencyResponse(
    row: ScanRequestOrmEntity,
  ): ScanRequestDto {
    try {
      return JSON.parse(row.idempotency_response) as ScanRequestDto;
    } catch {
      return ScanRequestDto.fromEntity(row, {
        catalogItem: null,
        reviewQueue: null,
        images: [],
      });
    }
  }

  private parseFaceOrThrow(faceRaw: string): ScanImageFace {
    if (faceRaw === 'front') {
      return ScanImageFace.FRONT;
    }
    if (faceRaw === 'back') {
      return ScanImageFace.BACK;
    }

    throw new BadRequestException('face must be front or back');
  }

  private executeDomainValidation<T>(callback: () => T): T {
    try {
      return callback();
    } catch (error) {
      if (error instanceof Error) {
        throw new BadRequestException(error.message);
      }

      throw error;
    }
  }

  private async buildScanRequestDto(
    scanRequest: ScanRequestOrmEntity,
  ): Promise<ScanRequestDto> {
    const catalogItem = scanRequest.catalog_item_id
      ? await this.catalogItemRepository.findOne({
          where: { id: scanRequest.catalog_item_id },
        })
      : null;

    const reviewQueue = await this.scanReviewQueueRepository.findOne({
      where: { scan_request_id: scanRequest.id },
    });

    const images = await this.scanLabelImageRepository.find({
      where: { scan_request_id: scanRequest.id },
      order: { created_at: 'ASC' },
    });

    return ScanRequestDto.fromEntity(scanRequest, {
      catalogItem: catalogItem
        ? ScanCatalogItemDto.fromEntity(catalogItem)
        : null,
      reviewQueue: reviewQueue
        ? ScanReviewQueueDto.fromEntity(reviewQueue)
        : null,
      images: images.map((image) => ScanLabelImageDto.fromEntity(image)),
    });
  }
}
