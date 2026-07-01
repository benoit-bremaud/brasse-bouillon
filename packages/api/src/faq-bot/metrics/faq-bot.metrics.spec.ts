import { FaqBotMetrics } from './faq-bot.metrics';

describe('FaqBotMetrics', () => {
  let metrics: FaqBotMetrics;

  beforeEach(() => {
    metrics = new FaqBotMetrics();
  });

  it('starts at zero (edge)', () => {
    expect(metrics.snapshot()).toEqual({
      answers: 0,
      errors: 0,
      promptTokens: 0,
      completionTokens: 0,
      estimatedMonthlyEur: 0,
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

  it('counts errors (no free-text stored)', () => {
    metrics.recordError();
    metrics.recordError();

    const snapshot = metrics.snapshot();
    expect(snapshot.errors).toBe(2);
  });
});
