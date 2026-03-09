import {
  SCAN_ALLOWED_IMAGE_MIME_TYPES,
  SCAN_DEFAULT_RETENTION_MONTHS,
  SCAN_MAX_IMAGE_FILES,
  SCAN_MAX_IMAGE_SIZE_BYTES,
} from '../../scan.constants';

import { ScanImageFace } from '../enums/scan-image-face.enum';

export interface BuildRetentionDateInput {
  from: Date;
  retentionMonths?: number;
}

export interface ValidateBarcodeInput {
  barcode: string;
}

export interface ValidateIdempotencyKeyInput {
  key: string;
}

export interface ValidateImageUploadInput {
  filesCount: number;
  face: ScanImageFace;
  mimeType: string;
  sizeBytes: number;
}

type AllowedImageMimeType = (typeof SCAN_ALLOWED_IMAGE_MIME_TYPES)[number];

export class ScanDomainService {
  buildRetentionDate(input: BuildRetentionDateInput): Date {
    const retentionMonths =
      input.retentionMonths ?? SCAN_DEFAULT_RETENTION_MONTHS;

    if (!Number.isInteger(retentionMonths) || retentionMonths <= 0) {
      throw new Error('Retention months must be a positive integer');
    }

    const retentionUntil = new Date(input.from.getTime());
    retentionUntil.setMonth(retentionUntil.getMonth() + retentionMonths);

    return retentionUntil;
  }

  validateBarcode(input: ValidateBarcodeInput): string {
    const barcode = input.barcode.trim();

    if (!/^\d{8,14}$/.test(barcode)) {
      throw new Error('Barcode must contain 8 to 14 digits');
    }

    return barcode;
  }

  validateIdempotencyKey(input: ValidateIdempotencyKeyInput): string {
    const key = input.key.trim();

    if (key.length < 8 || key.length > 128) {
      throw new Error('Idempotency key must contain 8 to 128 characters');
    }

    return key;
  }

  validateImageUpload(input: ValidateImageUploadInput): void {
    if (![ScanImageFace.FRONT, ScanImageFace.BACK].includes(input.face)) {
      throw new Error('Image face must be front or back');
    }

    if (input.filesCount < 1 || input.filesCount > SCAN_MAX_IMAGE_FILES) {
      throw new Error(
        `Image count must be between 1 and ${SCAN_MAX_IMAGE_FILES}`,
      );
    }

    if (
      !SCAN_ALLOWED_IMAGE_MIME_TYPES.includes(
        input.mimeType as AllowedImageMimeType,
      )
    ) {
      throw new Error('Image mime type must be image/jpeg or image/png');
    }

    if (input.sizeBytes <= 0 || input.sizeBytes > SCAN_MAX_IMAGE_SIZE_BYTES) {
      throw new Error(
        `Image size must be between 1 and ${SCAN_MAX_IMAGE_SIZE_BYTES} bytes`,
      );
    }
  }
}
