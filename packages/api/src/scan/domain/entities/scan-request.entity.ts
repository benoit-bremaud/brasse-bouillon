import { ScanRequestStatus } from '../enums/scan-request-status.enum';

export type ScanRequestId = string;
export type UserId = string;

export interface ScanRequest {
  readonly id: ScanRequestId;
  readonly ownerId: UserId;
  readonly barcode: string;
  readonly status: ScanRequestStatus;
  readonly idempotencyKey: string;
  readonly consentAiTraining: boolean;
  readonly retentionUntil: Date;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}
