import { createAlert, AlertValidationError } from './alert.factory';
import { AlertSeverity } from './enums/alert-severity.enum';
import { AlertTrigger } from './enums/alert-trigger.enum';

describe('createAlert', () => {
  // Happy path
  it('builds a normalised alert with all fields', () => {
    const triggeredAt = new Date('2026-05-20T08:00:00.000Z');
    const dismissedAt = new Date('2026-05-20T09:00:00.000Z');
    const a = createAlert({
      batchId: 'b-1',
      trigger: AlertTrigger.OVERDUE,
      severity: AlertSeverity.WARNING,
      stepOrder: 1,
      message: '  Empâtage en retard  ',
      triggeredAt,
      dismissedAt,
    });

    expect(a).toEqual({
      batchId: 'b-1',
      trigger: AlertTrigger.OVERDUE,
      severity: AlertSeverity.WARNING,
      stepOrder: 1,
      message: 'Empâtage en retard', // trimmed
      triggeredAt,
      dismissedAt,
    });
  });

  // Happy path: optional fields default
  it('defaults stepOrder/message/dismissedAt to null and triggeredAt to now', () => {
    const before = Date.now();
    const a = createAlert({
      batchId: 'b-1',
      trigger: AlertTrigger.THRESHOLD,
      severity: AlertSeverity.CRITICAL,
    });

    expect(a.stepOrder).toBeNull();
    expect(a.message).toBeNull();
    expect(a.dismissedAt).toBeNull();
    expect(a.triggeredAt.getTime()).toBeGreaterThanOrEqual(before);
  });

  // Sad path: missing batch
  it('rejects an empty batchId', () => {
    expect(() =>
      createAlert({
        batchId: '',
        trigger: AlertTrigger.OVERDUE,
        severity: AlertSeverity.INFO,
      }),
    ).toThrow(AlertValidationError);
  });

  // Sad path: unknown enum values
  it('rejects an unknown trigger', () => {
    expect(() =>
      createAlert({
        batchId: 'b-1',
        trigger: 'boom' as AlertTrigger,
        severity: AlertSeverity.INFO,
      }),
    ).toThrow(/trigger/);
  });

  it('rejects an unknown severity', () => {
    expect(() =>
      createAlert({
        batchId: 'b-1',
        trigger: AlertTrigger.OVERDUE,
        severity: 'meh' as AlertSeverity,
      }),
    ).toThrow(/severity/);
  });

  // Edge: dismissal before trigger
  it('rejects a dismissedAt that predates triggeredAt', () => {
    const triggeredAt = new Date('2026-05-20T10:00:00.000Z');
    const dismissedAt = new Date('2026-05-20T09:00:00.000Z');
    expect(() =>
      createAlert({
        batchId: 'b-1',
        trigger: AlertTrigger.THRESHOLD,
        severity: AlertSeverity.WARNING,
        triggeredAt,
        dismissedAt,
      }),
    ).toThrow(/dismissedAt/);
  });

  // Edge: negative or non-integer stepOrder
  it.each([-1, 2.5])(
    'rejects a negative or non-integer stepOrder %p',
    (stepOrder) => {
      expect(() =>
        createAlert({
          batchId: 'b-1',
          trigger: AlertTrigger.OVERDUE,
          severity: AlertSeverity.INFO,
          stepOrder,
        }),
      ).toThrow(/stepOrder/);
    },
  );
});
