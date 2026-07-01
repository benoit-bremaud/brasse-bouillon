import { BatchStatus, deriveEffectiveStatus } from './batch-status.enum';

describe('deriveEffectiveStatus', () => {
  it('returns the raw brewing lifecycle status when no soft stamp exists', () => {
    expect(deriveEffectiveStatus(BatchStatus.IN_PROGRESS, null, null)).toBe(
      BatchStatus.IN_PROGRESS,
    );
    expect(deriveEffectiveStatus(BatchStatus.COMPLETED, null, null)).toBe(
      BatchStatus.COMPLETED,
    );
  });

  it('derives cancelled when cancelled_at is set', () => {
    expect(
      deriveEffectiveStatus(
        BatchStatus.IN_PROGRESS,
        new Date('2026-06-01T10:00:00.000Z'),
        null,
      ),
    ).toBe('cancelled');
  });

  it('derives archived before cancelled when both soft stamps are set', () => {
    expect(
      deriveEffectiveStatus(
        BatchStatus.IN_PROGRESS,
        new Date('2026-06-01T10:00:00.000Z'),
        new Date('2026-06-02T10:00:00.000Z'),
      ),
    ).toBe('archived');
  });
});
