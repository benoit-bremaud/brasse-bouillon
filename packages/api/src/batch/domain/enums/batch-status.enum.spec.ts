import { BatchStatus, deriveEffectiveStatus } from './batch-status.enum';

describe('deriveEffectiveStatus', () => {
  const launchedAt = new Date('2026-05-01T10:00:00.000Z');

  it('returns the raw brewing lifecycle status when launched and no soft stamp exists', () => {
    expect(
      deriveEffectiveStatus(BatchStatus.IN_PROGRESS, null, null, launchedAt),
    ).toBe(BatchStatus.IN_PROGRESS);
    expect(
      deriveEffectiveStatus(BatchStatus.COMPLETED, null, null, launchedAt),
    ).toBe(BatchStatus.COMPLETED);
  });

  it('derives draft when launched_at is missing (never-launched prep, brew-day/07)', () => {
    expect(
      deriveEffectiveStatus(BatchStatus.IN_PROGRESS, null, null, null),
    ).toBe('draft');
    expect(
      deriveEffectiveStatus(BatchStatus.IN_PROGRESS, null, null, undefined),
    ).toBe('draft');
  });

  it('derives cancelled when cancelled_at is set', () => {
    expect(
      deriveEffectiveStatus(
        BatchStatus.IN_PROGRESS,
        new Date('2026-06-01T10:00:00.000Z'),
        null,
        launchedAt,
      ),
    ).toBe('cancelled');
  });

  it('derives archived before cancelled when both soft stamps are set', () => {
    expect(
      deriveEffectiveStatus(
        BatchStatus.IN_PROGRESS,
        new Date('2026-06-01T10:00:00.000Z'),
        new Date('2026-06-02T10:00:00.000Z'),
        launchedAt,
      ),
    ).toBe('archived');
  });

  it('never reports a soft-closed batch as draft (stamps win over a missing launched_at)', () => {
    // Unreachable through the API guards (a draft cannot be cancelled or
    // archived) — locked here so the precedence stays archived > cancelled >
    // draft even if data drifts.
    expect(
      deriveEffectiveStatus(
        BatchStatus.IN_PROGRESS,
        new Date('2026-06-01T10:00:00.000Z'),
        null,
        null,
      ),
    ).toBe('cancelled');
  });
});
