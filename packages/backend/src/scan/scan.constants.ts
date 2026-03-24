export const SCAN_ALLOWED_IMAGE_MIME_TYPES = [
  'image/jpeg',
  'image/png',
] as const;

export const SCAN_MAX_IMAGE_FILES = 2;
export const SCAN_MAX_IMAGE_SIZE_BYTES = 8 * 1024 * 1024;

export const SCAN_DEFAULT_UPLOAD_DIR = 'uploads/scan-labels';
export const SCAN_DEFAULT_RETENTION_MONTHS = 12;
