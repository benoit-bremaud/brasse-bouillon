import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

import {
  SUB_CATEGORIES_BY_CATEGORY,
  TopLevelCategory,
} from '../feedback.constants';

/**
 * Validates that `subCategory` is consistent with the sibling
 * `category` field, per the `feedback-widget` taxonomy:
 *
 * - `other` → `subCategory` must be `null` / absent.
 * - any other category → `subCategory` must be one of that category's
 *   allowed values.
 *
 * Synchronous, no dependency injection. When `category` itself is
 * invalid, this constraint passes (the `@IsEnum` on `category` reports
 * that error — we avoid double-reporting).
 */
@ValidatorConstraint({ name: 'isValidSubCategory', async: false })
export class IsValidSubCategoryConstraint implements ValidatorConstraintInterface {
  validate(value: unknown, args: ValidationArguments): boolean {
    const category = (args.object as { category?: unknown }).category as
      | TopLevelCategory
      | undefined;

    if (category === undefined || !(category in SUB_CATEGORIES_BY_CATEGORY)) {
      return true;
    }

    if (category === 'other') {
      return value === null || value === undefined;
    }

    const allowed = SUB_CATEGORIES_BY_CATEGORY[category] as readonly string[];
    return typeof value === 'string' && allowed.includes(value);
  }

  defaultMessage(args: ValidationArguments): string {
    const category = (args.object as { category?: unknown }).category;
    return `subCategory is not valid for category "${String(category)}"`;
  }
}

export function IsValidSubCategory(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string): void {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsValidSubCategoryConstraint,
    });
  };
}
