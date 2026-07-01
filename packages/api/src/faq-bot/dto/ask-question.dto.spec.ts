import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';

import { AskQuestionDto } from './ask-question.dto';

function errorsFor(input: object): number {
  return validateSync(plainToInstance(AskQuestionDto, input)).length;
}

describe('AskQuestionDto', () => {
  it('accepts a valid question (happy)', () => {
    expect(errorsFor({ question: 'C’est quoi brasse-bouillon ?' })).toBe(0);
  });

  it('accepts an optional altcha payload (happy)', () => {
    expect(errorsFor({ question: 'hi', altcha: 'solved-payload' })).toBe(0);
  });

  it('rejects a missing question (sad)', () => {
    expect(errorsFor({})).toBeGreaterThan(0);
  });

  it('rejects an empty question (sad)', () => {
    expect(errorsFor({ question: '' })).toBeGreaterThan(0);
  });

  it('rejects a whitespace-only question after trim (edge)', () => {
    expect(errorsFor({ question: '   ' })).toBeGreaterThan(0);
  });

  it('rejects a question longer than 500 chars (edge)', () => {
    expect(errorsFor({ question: 'a'.repeat(501) })).toBeGreaterThan(0);
  });
});
