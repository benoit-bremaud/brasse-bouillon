import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'crypto';
import { QueryFailedError, Repository } from 'typeorm';

import { NotABeerException } from '../exceptions/not-a-beer.exception';
import { ScanCatalogSource } from '../domain/enums/scan-catalog-source.enum';
import { ScanImageFace } from '../domain/enums/scan-image-face.enum';
import { ScanRequestStatus } from '../domain/enums/scan-request-status.enum';
import { ScanReviewStatus } from '../domain/enums/scan-review-status.enum';
import { ScanDomainService } from '../domain/services/scan-domain.service';
import { AdminMarkScanReviewNotFoundDto } from '../dtos/admin-mark-scan-review-not-found.dto';
import { AdminResolveScanReviewDto } from '../dtos/admin-resolve-scan-review.dto';
import { ScanCatalogItemDto } from '../dtos/scan-catalog-item.dto';
import { ScanLabelImageDto } from '../dtos/scan-label-image.dto';
import { ScanRequestDto } from '../dtos/scan-request.dto';
import { ScanReviewQueueDto } from '../dtos/scan-review-queue.dto';
import { SubmitScanBarcodeDto } from '../dtos/submit-scan-barcode.dto';
import { ScanCatalogItemOrmEntity } from '../entities/scan-catalog-item.orm.entity';
import { ScanLabelImageOrmEntity } from '../entities/scan-label-image.orm.entity';
import { ScanRequestOrmEntity } from '../entities/scan-request.orm.entity';
import { ScanReviewQueueOrmEntity } from '../entities/scan-review-queue.orm.entity';
import { UploadedImageFile } from '../scan.types';
import { OpenFoodFactsClient } from './openfoodfacts.client';
import { ScanFermentationType } from '../domain/enums/scan-fermentation-type.enum';
import { ScanLookupResultDto } from '../dtos/scan-lookup-result.dto';
import { ScanStorageService } from './scan-storage.service';

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
    private readonly openFoodFactsClient: OpenFoodFactsClient,
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

    const existingByIdempotency = await this.findByIdempotency(
      ownerId,
      idempotencyKey,
    );

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

    try {
      await this.scanRequestRepository.save(scanRequest);
    } catch (error) {
      if (this.isUniqueIdempotencyConstraintError(error)) {
        const persistedByIdempotency = await this.findByIdempotency(
          ownerId,
          idempotencyKey,
        );

        if (persistedByIdempotency) {
          return this.deserializeIdempotencyResponse(persistedByIdempotency);
        }
      }

      throw error;
    }

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
      : this.catalogItemRepository.create({
          id: randomUUID(),
          // New catalog items created via admin review resolution are
          // by definition operator-curated, not seed data. The default
          // 'seed' clause from migration 1777000000000 would otherwise
          // mislabel them and corrupt cache / matching provenance.
          source: ScanCatalogSource.MANUAL,
        });

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
    scanRequest.catalog_item_id = null;
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

  private async findByIdempotency(
    ownerId: string,
    idempotencyKey: string,
  ): Promise<ScanRequestOrmEntity | null> {
    return this.scanRequestRepository.findOne({
      where: { owner_id: ownerId, idempotency_key: idempotencyKey },
    });
  }

  private isUniqueIdempotencyConstraintError(error: unknown): boolean {
    if (!(error instanceof QueryFailedError)) {
      return false;
    }

    const driverError = error.driverError as {
      code?: string;
      message?: string;
      errno?: number;
    };

    const message = (driverError.message ?? '').toLowerCase();

    return (
      driverError.code === 'SQLITE_CONSTRAINT' ||
      driverError.errno === 19 ||
      message.includes('uq_scan_requests_owner_idempotency_key') ||
      message.includes('scan_requests.owner_id, scan_requests.idempotency_key')
    );
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

  /**
   * Looks up a beer by EAN-13 with the OpenFoodFacts proxy + cache
   * (Issue #696, Epic #693 part 5/n / Scan tranche 2 chunk #1).
   *
   * Strategy:
   * 1. SELECT the catalog row by barcode.
   * 2. If a row exists AND it is fresh (`fetched_at` is null for
   *    seed/manual rows OR younger than 1h for OFF rows) → return as
   *    `cache_hit_fresh`. Seed/manual rows never expire (we trust
   *    them more than OFF) — `fetched_at = null` is the marker.
   * 3. Otherwise hit OFF, persist with `source = 'openfoodfacts'`
   *    and `fetched_at = now()`, return as `cache_miss_fetched` (or
   *    `cache_hit_stale` if a row was already there and we refreshed
   *    it).
   *
   * Errors:
   * - OFF responds 404 (product not in their DB) AND we have no
   *   cache row → caller-facing 404 (raised as NotFoundException).
   * - OFF unreachable / 5xx AND we have a stale row → return the
   *   stale row as `cache_hit_stale` (degraded but usable).
   * - OFF unreachable / 5xx AND we have no row → caller-facing 503
   *   (raised as ServiceUnavailableException).
   */
  async lookupByBarcode(rawEan: string): Promise<ScanLookupResultDto> {
    const barcode = this.executeDomainValidation(() =>
      this.domainService.validateBarcode({ barcode: rawEan }),
    );

    const cached = await this.catalogItemRepository.findOne({
      where: { barcode },
    });

    if (cached && this.isCacheFresh(cached)) {
      return this.buildLookupResult(cached, 'cache_hit_fresh');
    }

    let lookup: Awaited<ReturnType<OpenFoodFactsClient['lookupByBarcode']>>;
    try {
      lookup = await this.openFoodFactsClient.lookupByBarcode(barcode);
    } catch {
      // Upstream unreachable. Degraded mode if we have ANY cached row.
      if (cached) {
        return this.buildLookupResult(cached, 'cache_hit_stale');
      }
      throw new ServiceUnavailableException(
        'OpenFoodFacts is unreachable and the barcode is not in the local cache. Try again later.',
      );
    }

    if (!lookup.found) {
      // OFF lost the product. Either degrade to cache or 404.
      if (cached) {
        return this.buildLookupResult(cached, 'cache_hit_stale');
      }
      throw new NotFoundException(
        `Barcode ${barcode} not found in OpenFoodFacts and not in the local catalog.`,
      );
    }

    if (!lookup.isBeer) {
      // OFF returned a real product, but its categories_tags do
      // not include any beer category (cider / food / soft drink).
      // Issue #798 jury edge case D — surface the product name so
      // the mobile client can render a dedicated "ce n'est pas une
      // bière" screen instead of treating this as a generic 404.
      // Codex P2 #729: never pollute the beer-only catalog with
      // non-beer placeholder rows. Cache fallback still applies
      // for previously-stored beer entries on the same barcode.
      if (cached) {
        return this.buildLookupResult(cached, 'cache_hit_stale');
      }
      throw new NotABeerException(barcode, lookup.name);
    }

    const persisted = await this.upsertFromOpenFoodFacts(
      barcode,
      cached,
      lookup,
    );
    return this.buildLookupResult(
      persisted,
      cached ? 'cache_hit_stale' : 'cache_miss_fetched',
    );
  }

  /**
   * Cache-freshness rule:
   * - Rows with `fetched_at = null` are seed or manual entries — they
   *   never expire (we trust those more than OFF).
   * - Rows with `fetched_at != null` are OFF cache entries — fresh if
   *   younger than 1h, stale otherwise.
   */
  private isCacheFresh(row: ScanCatalogItemOrmEntity): boolean {
    if (!row.fetched_at) return true;
    const ageMs = Date.now() - row.fetched_at.getTime();
    return ageMs < 60 * 60 * 1000;
  }

  private async upsertFromOpenFoodFacts(
    barcode: string,
    existing: ScanCatalogItemOrmEntity | null,
    lookup: Awaited<ReturnType<OpenFoodFactsClient['lookupByBarcode']>>,
  ): Promise<ScanCatalogItemOrmEntity> {
    const target =
      existing ?? this.catalogItemRepository.create({ id: randomUUID() });

    target.barcode = barcode;
    target.name = lookup.name ?? target.name ?? 'Unknown';
    target.brewery = lookup.brewery ?? target.brewery ?? 'Unknown';
    target.style = target.style ?? 'Unknown';
    // is_abv_estimated must reflect whether the FINAL persisted ABV
    // is fresh OFF data or fallback. If OFF brought a real number,
    // we use it and clear the estimate flag. If OFF brought null
    // and we already have a cached number, we keep the cached
    // number AND its previous estimate flag (don't relabel a real
    // value as estimated just because OFF was silent on this call).
    if (lookup.abv != null) {
      target.abv = lookup.abv;
      target.is_abv_estimated = false;
    } else {
      target.abv = target.abv ?? null;
      // Keep target.is_abv_estimated as-is. For a brand-new row
      // (no existing) it defaults to false on the entity column;
      // explicitly set it true since we have no real value.
      if (existing == null) {
        target.is_abv_estimated = true;
      }
    }
    target.ibu = target.ibu ?? null;
    target.color_ebc = target.color_ebc ?? null;
    target.fermentation_type =
      target.fermentation_type ?? ScanFermentationType.UNKNOWN;
    target.aromatic_tags = target.aromatic_tags ?? null;
    target.notes_source = target.notes_source ?? 'openfoodfacts.org';
    target.is_ibu_estimated = true;
    target.is_color_ebc_estimated = true;
    target.is_style_estimated = true;
    target.source = ScanCatalogSource.OPENFOODFACTS;
    target.fetched_at = new Date();
    target.raw_payload = JSON.stringify(lookup.payload);

    try {
      return await this.catalogItemRepository.save(target);
    } catch (error) {
      // Codex P1 #729: TOCTOU on cache miss — two concurrent requests
      // for the same uncached barcode both pass `findOne(null)` then
      // both `INSERT`. The second INSERT violates the UNIQUE index on
      // `barcode` and would otherwise bubble up as a 500. We catch
      // the unique-constraint failure, re-read the row inserted by
      // the racing request, and return it. Other DB errors keep
      // propagating.
      if (
        error instanceof QueryFailedError &&
        this.isUniqueConstraintViolation(error)
      ) {
        const winner = await this.catalogItemRepository.findOne({
          where: { barcode },
        });
        if (winner) {
          return winner;
        }
      }
      throw error;
    }
  }

  private isUniqueConstraintViolation(error: QueryFailedError): boolean {
    const message = error.message?.toLowerCase() ?? '';
    return (
      message.includes('unique constraint') ||
      message.includes('unique violation') ||
      message.includes('sqlite_constraint')
    );
  }

  private buildLookupResult(
    row: ScanCatalogItemOrmEntity,
    source: ScanLookupResultDto['source'],
  ): ScanLookupResultDto {
    return {
      item: ScanCatalogItemDto.fromEntity(row),
      source,
      rawPayloadAvailable: row.raw_payload != null,
    };
  }
}
