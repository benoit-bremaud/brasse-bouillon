import { FaqBotMetrics } from './faq-bot.metrics';

describe('FaqBotMetrics', () => {
  let metrics: FaqBotMetrics;

  beforeEach(() => {
    metrics = new FaqBotMetrics();
  });

  it('starts at zero (edge)', () => {
    expect(metrics.snapshot()).toEqual({
      answers: 0,
      abstentions: 0,
      errors: 0,
      promptTokens: 0,
      completionTokens: 0,
      estimatedMonthlyEur: 0,
      chipCounts: {},
    });
  });

  it('accumulates answers and token usage (happy)', () => {
    metrics.recordAnswer(100, 20);
    metrics.recordAnswer(50, 10);

    const snapshot = metrics.snapshot();
    expect(snapshot.answers).toBe(2);
    expect(snapshot.promptTokens).toBe(150);
    expect(snapshot.completionTokens).toBe(30);
    expect(snapshot.estimatedMonthlyEur).toBeGreaterThan(0);
  });

  it('counts abstentions, errors and predefined chips (no free-text stored)', () => {
    metrics.recordAbstention();
    metrics.recordError();
    metrics.recordChip('what-is');
    metrics.recordChip('what-is');
    metrics.recordChip('join-beta');

    const snapshot = metrics.snapshot();
    expect(snapshot.abstentions).toBe(1);
    expect(snapshot.errors).toBe(1);
    expect(snapshot.chipCounts).toEqual({ 'what-is': 2, 'join-beta': 1 });
  });
});
