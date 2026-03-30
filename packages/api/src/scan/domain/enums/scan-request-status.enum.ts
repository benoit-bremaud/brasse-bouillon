export enum ScanRequestStatus {
  MATCHED = 'matched',
  UNKNOWN_BARCODE = 'unknown_barcode',
  NEEDS_HUMAN_REVIEW = 'needs_human_review',
  RESOLVED = 'resolved',
  NOT_FOUND = 'not_found',
}
