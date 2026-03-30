import { ScanReviewStatus } from '../enums/scan-review-status.enum';

export type ScanReviewQueueId = string;
export type ScanRequestId = string;
export type UserId = string;

export interface ScanReviewQueue {
  readonly id: ScanReviewQueueId;
  readonly scanRequestId: ScanRequestId;
  readonly status: ScanReviewStatus;
  readonly internalNote?: string;
  readonly reviewedBy?: UserId;
  readonly reviewedAt?: Date;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}
