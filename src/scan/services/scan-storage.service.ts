import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import {
  SCAN_ALLOWED_IMAGE_MIME_TYPES,
  SCAN_DEFAULT_UPLOAD_DIR,
  SCAN_MAX_IMAGE_SIZE_BYTES,
} from '../scan.constants';
import { extname, join } from 'path';

import { UploadedImageFile } from '../scan.types';
import { promises as fs } from 'fs';
import { randomUUID } from 'crypto';

interface StoreImageInput {
  ownerId: string;
  scanRequestId: string;
  face: 'front' | 'back';
  file: UploadedImageFile;
}

interface StoredImageResult {
  filePath: string;
  mimeType: string;
  sizeBytes: number;
}

type AllowedImageMimeType = (typeof SCAN_ALLOWED_IMAGE_MIME_TYPES)[number];

@Injectable()
export class ScanStorageService {
  private readonly uploadRoot = join(process.cwd(), SCAN_DEFAULT_UPLOAD_DIR);

  async storeImage(input: StoreImageInput): Promise<StoredImageResult> {
    this.assertValidFile(input.file);

    const extension = this.resolveExtension(input.file);
    const relativePath = join(
      input.ownerId,
      input.scanRequestId,
      `${input.face}-${randomUUID()}${extension}`,
    );

    const absolutePath = join(this.uploadRoot, relativePath);
    const parentDirectory = absolutePath.substring(
      0,
      absolutePath.lastIndexOf('/'),
    );

    try {
      await fs.mkdir(parentDirectory, { recursive: true });
      await fs.writeFile(absolutePath, input.file.buffer);
    } catch {
      throw new InternalServerErrorException('Failed to store label image');
    }

    return {
      filePath: join(SCAN_DEFAULT_UPLOAD_DIR, relativePath),
      mimeType: input.file.mimetype,
      sizeBytes: input.file.size,
    };
  }

  private assertValidFile(file: UploadedImageFile): void {
    if (!file || !file.buffer) {
      throw new BadRequestException('Image file is required');
    }

    if (
      !SCAN_ALLOWED_IMAGE_MIME_TYPES.includes(
        file.mimetype as AllowedImageMimeType,
      )
    ) {
      throw new BadRequestException('Only JPEG and PNG images are supported');
    }

    if (file.size <= 0 || file.size > SCAN_MAX_IMAGE_SIZE_BYTES) {
      throw new BadRequestException(
        `Image size must be between 1 and ${SCAN_MAX_IMAGE_SIZE_BYTES} bytes`,
      );
    }
  }

  private resolveExtension(file: UploadedImageFile): string {
    const fromOriginalName = extname(file.originalname || '').toLowerCase();
    if (fromOriginalName === '.jpg' || fromOriginalName === '.jpeg') {
      return '.jpg';
    }
    if (fromOriginalName === '.png') {
      return '.png';
    }

    return file.mimetype === 'image/png' ? '.png' : '.jpg';
  }
}
