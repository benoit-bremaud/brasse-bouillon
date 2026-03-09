import { ScanImageFace } from '../enums/scan-image-face.enum';

export type ScanLabelImageId = string;
export type ScanRequestId = string;

export interface ScanLabelImage {
  readonly id: ScanLabelImageId;
  readonly scanRequestId: ScanRequestId;
  readonly face: ScanImageFace;
  readonly filePath: string;
  readonly mimeType: string;
  readonly sizeBytes: number;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}
