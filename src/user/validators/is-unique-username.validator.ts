import {
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  registerDecorator,
} from 'class-validator';

import { Injectable } from '@nestjs/common';
import { UserService } from '../services/user.service';

/**
 * Is Unique Username Validator Constraint
 *
 * This is the actual validation logic that checks if a username exists in the database.
 * It's a constraint that can be reused by multiple decorators.
 *
 * @class IsUniqueUsernameConstraint
 * @implements {ValidatorConstraintInterface}
 *
 * @description
 * This constraint queries the UserService to check if a username already exists.
 * If it exists, validation fails with the message "Username already exists".
 *
 * @example
 * @IsUniqueUsername()
 * username: string;
 */
@ValidatorConstraint({ name: 'IsUniqueUsername', async: true })
@Injectable()
export class IsUniqueUsernameConstraint
  implements ValidatorConstraintInterface
{
  /**
   * Constructor - Injects the User service
   *
   * @param {UserService} userService - Service to query users
   */
  constructor(private readonly userService: UserService) {}

  /**
   * Main validation logic
   *
   * Queries the database to check if username already exists.
   *
   * @param {string} username - The username to validate
   *
   * @returns {Promise<boolean>} True if username is unique (not found), False if already exists
   *
   * @description
   * This method is called by class-validator when the @IsUniqueUsername() decorator is used.
   * It returns true if the username is unique (NOT in DB).
   * It returns false if the username already exists (validation FAILS).
   */
  async validate(username: string): Promise<boolean> {
    // Try to find a user with this username
    const user = await this.userService.findByUsername(username);

    // If user is found, return false (validation fails - username not unique)
    // If user is NOT found, return true (validation passes - username is unique)
    return !user;
  }

  /**
   * Default error message if validation fails
   *
   * @returns {string} Error message to show to the user
   */
  defaultMessage(): string {
    return 'Username already exists. Please use a different username.';
  }
}

/**
 * Is Unique Username Decorator
 *
 * This decorator is what you use in your DTOs to validate that a username is unique.
 * It wraps the constraint and provides a clean API.
 *
 * @decorator @IsUniqueUsername()
 *
 * @param {ValidationOptions} [validationOptions] - Optional validation options
 *
 * @returns {PropertyDecorator} Decorator function
 *
 * @example
 * export class CreateUserDto {
 *   @IsUniqueUsername()
 *   username: string;
 * }
 */
export function IsUniqueUsername(
  validationOptions?: ValidationOptions,
): PropertyDecorator {
  return function (target: object, propertyName: string | symbol | undefined) {
    registerDecorator({
      target: target.constructor,
      propertyName: propertyName as string,
      options: validationOptions,
      constraints: [],
      validator: IsUniqueUsernameConstraint,
    });
  };
}
