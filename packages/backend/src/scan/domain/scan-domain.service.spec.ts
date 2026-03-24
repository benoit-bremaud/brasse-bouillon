import { ScanDomainService } from './services/scan-domain.service';
import { ScanImageFace } from './enums/scan-image-face.enum';

describe('ScanDomainService', () => {
  let service: ScanDomainService;

  beforeEach(() => {
    service = new ScanDomainService();
  });

  describe('validateBarcode()', () => {
    it('should trim and validate barcode with 8 to 14 digits', () => {
      const barcode = service.validateBarcode({ barcode: ' 3271234567890 ' });

      expect(barcode).toBe('3271234567890');
    });

    it('should throw when barcode is invalid', () => {
      expect(() => service.validateBarcode({ barcode: 'ABCD1234' })).toThrow(
        'Barcode must contain 8 to 14 digits',
      );
    });
  });

  describe('validateIdempotencyKey()', () => {
    it('should trim and validate idempotency key length', () => {
      const key = service.validateIdempotencyKey({ key: '  idem-key-1234  ' });

      expect(key).toBe('idem-key-1234');
    });

    it('should throw when key is too short', () => {
      expect(() => service.validateIdempotencyKey({ key: 'short' })).toThrow(
        'Idempotency key must contain 8 to 128 characters',
      );
    });
  });

  describe('validateImageUpload()', () => {
    it('should accept a valid image upload payload', () => {
      expect(() =>
        service.validateImageUpload({
          filesCount: 1,
          face: ScanImageFace.FRONT,
          mimeType: 'image/jpeg',
          sizeBytes: 512_000,
        }),
      ).not.toThrow();
    });

    it('should throw when mime type is not supported', () => {
      expect(() =>
        service.validateImageUpload({
          filesCount: 1,
          face: ScanImageFace.BACK,
          mimeType: 'image/gif',
          sizeBytes: 1_024,
        }),
      ).toThrow('Image mime type must be image/jpeg or image/png');
    });
  });

  describe('buildRetentionDate()', () => {
    it('should add retention months to reference date', () => {
      const from = new Date('2026-01-15T10:00:00.000Z');

      const result = service.buildRetentionDate({ from, retentionMonths: 12 });

      expect(result.toISOString()).toBe('2027-01-15T10:00:00.000Z');
    });
  });
});
