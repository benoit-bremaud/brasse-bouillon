import { ValidationArguments } from 'class-validator';

import { IsValidSubCategoryConstraint } from './is-valid-sub-category.validator';

/**
 * Builds the ValidationArguments shape the constraint reads, with the
 * sibling `category` set on `object`.
 */
function argsFor(category: unknown): ValidationArguments {
  return {
    object: { category },
    value: undefined,
    targetName: 'CreateFeedbackDto',
    property: 'subCategory',
    constraints: [],
  };
}

describe('IsValidSubCategoryConstraint', () => {
  const constraint = new IsValidSubCategoryConstraint();

  // Happy path — a valid pairing
  it('accepts a sub-category that belongs to its category', () => {
    expect(constraint.validate('crash', argsFor('bug'))).toBe(true);
    expect(constraint.validate('improvement', argsFor('suggestion'))).toBe(
      true,
    );
  });

  // Happy path — 'other' requires a null sub-category
  it('accepts null for the "other" category', () => {
    expect(constraint.validate(null, argsFor('other'))).toBe(true);
    expect(constraint.validate(undefined, argsFor('other'))).toBe(true);
  });

  // Sad path — mismatched pairing
  it('rejects a sub-category that does not belong to its category', () => {
    expect(constraint.validate('wrong-output', argsFor('typo'))).toBe(false);
    expect(constraint.validate('crash', argsFor('suggestion'))).toBe(false);
  });

  // Sad path — 'other' must not carry a sub-category
  it('rejects a non-null sub-category for "other"', () => {
    expect(constraint.validate('crash', argsFor('other'))).toBe(false);
  });

  // Edge case — non-string sub-category for a category that needs one
  it('rejects a missing sub-category for a category that requires one', () => {
    expect(constraint.validate(undefined, argsFor('bug'))).toBe(false);
    expect(constraint.validate(null, argsFor('bug'))).toBe(false);
  });

  // Edge case — unknown category defers to @IsEnum (passes here)
  it('passes when the category itself is invalid (avoids double-reporting)', () => {
    expect(constraint.validate('crash', argsFor('nonsense'))).toBe(true);
    expect(constraint.validate('crash', argsFor(undefined))).toBe(true);
  });
});
