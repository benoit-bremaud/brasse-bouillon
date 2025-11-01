import {
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  registerDecorator,
} from 'class-validator';

import { Injectable } from '@nestjs/common';
import { UserService } from '../services/user.service';

/**
 * Is Unique Email Validator Constraint
 *
 * This is the actual validation logic that checks if an email exists in the database.
 * It's a constraint that can be reused by multiple decorators.
 *
 * @class IsUniqueEmailConstraint
 * @implements {ValidatorConstraintInterface}
 *
 * @description
 * This constraint queries the UserService to check if an email already exists.
 * If it exists, validation fails with the message "Email already exists".
 *
 * @example
 * @IsUniqueEmail()
 * email: string;
 */
@ValidatorConstraint({ name: 'IsUniqueEmail', async: true })
@Injectable()
export class IsUniqueEmailConstraint implements ValidatorConstraintInterface {
  /**
   * Constructor - Injects the User service
   *
   * @param {UserService} userService - Service to query users
   */
  constructor(private readonly userService: UserService) {}

  /**
   * Main validation logic
   *
   * Queries the database to check if email already exists.
   *
   * @param {string} email - The email address to validate
   *
   * @returns {Promise<boolean>} True if email is unique (not found), False if already exists
   *
   * @description
   * This method is called by class-validator when the @IsUniqueEmail() decorator is used.
   * It returns true if the email is unique (NOT in DB).
   * It returns false if the email already exists (validation FAILS).
   */
  async validate(email: string): Promise<boolean> {
    // Try to find a user with this email
    const user = await this.userService.findByEmail(email);

    // If user is found, return false (validation fails - email not unique)
    // If user is NOT found, return true (validation passes - email is unique)
    return !user;
  }

  /**
   * Default error message if validation fails
   *
   * @returns {string} Error message to show to the user
   */
  defaultMessage(): string {
    return 'Email already exists. Please use a different email address.';
  }
}

/**
 * Is Unique Email Decorator
 *
 * This decorator is what you use in your DTOs to validate that an email is unique.
 * It wraps the constraint and provides a clean API.
 *
 * @decorator @IsUniqueEmail()
 *
 * @param {ValidationOptions} [validationOptions] - Optional validation options
 *
 * @returns {PropertyDecorator} Decorator function
 *
 * @example
 * export class CreateUserDto {
 *   @IsUniqueEmail()
 *   email: string;
 * }
 */
export function IsUniqueEmail(
  validationOptions?: ValidationOptions,
): PropertyDecorator {
  return function (target: object, propertyName: string | symbol | undefined) {
    registerDecorator({
      target: target.constructor,
      propertyName: propertyName as string,
      options: validationOptions,
      constraints: [],
      validator: IsUniqueEmailConstraint,
    });
  };
}
