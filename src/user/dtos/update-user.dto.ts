import {
  IsEmail,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

import { IsUniqueEmail } from '../validators/is-unique-email.validator';
import { IsUniqueUsername } from '../validators/is-unique-username.validator';

/**
 * Update User DTO
 *
 * Data Transfer Object for updating an existing user.
 * All fields are optional - you can update any combination of fields.
 *
 * @class UpdateUserDto
 *
 * @description
 * This DTO is used when a client sends a request to update a user.
 * Unlike CreateUserDto, ALL fields are optional here.
 * Only the fields provided in the request will be updated.
 *
 * Validation rules:
 * - email: Optional, must be valid email format if provided, max 255 chars, UNIQUE in DB
 * - username: Optional, 3-20 chars, alphanumeric + underscore only, UNIQUE in DB
 * - first_name: Optional, max 100 chars
 * - last_name: Optional, max 100 chars
 *
 * NOTE: Password updates are NOT allowed through this endpoint.
 * There should be a separate /auth/change-password endpoint for that.
 *
 * @example
 * // Valid update request - update only first_name
 * {
 *   "first_name": "Johnny"
 * }
 *
 * @example
 * // Valid update request - update email and username
 * {
 *   "email": "newemail@example.com",
 *   "username": "new_username"
 * }
 *
 * @example
 * // Invalid request body - will be rejected
 * {
 *   "email": "invalid-email",  // ❌ Not an email
 *   "username": "ab"           // ❌ Too short (min 3)
 * }
 *
 * @example
 * // Invalid - duplicate email
 * {
 *   "email": "existing@example.com"  // ❌ Already used by another user
 * }
 */
export class UpdateUserDto {
  /**
   * User's email address (optional)
   *
   * Can be updated if the user changes their email.
   * Must not already exist in the database (for another user).
   *
   * @type {string | undefined}
   * @validation
   * - @IsOptional() - Not required
   * - @IsEmail() - If provided, must be valid email format
   * - @IsUniqueEmail() - If provided, must not already exist in DB (async)
   * - @MaxLength(255) - Maximum 255 characters
   *
   * @example "newemail@example.com"
   */
  @IsOptional()
  @IsEmail(
    {},
    {
      message: 'Email must be a valid email address',
    },
  )
  @IsUniqueEmail({
    message: 'Email already exists. Please use a different email address.',
  })
  @MaxLength(255, {
    message: 'Email must not be longer than 255 characters',
  })
  email?: string;

  /**
   * User's username (optional)
   *
   * Can be updated if the user wants a new username.
   * Must be unique in the database (for another user).
   * Only alphanumeric characters and underscores are allowed.
   *
   * @type {string | undefined}
   * @validation
   * - @IsOptional() - Not required
   * - @IsString() - If provided, must be a string
   * - @MinLength(3) - Minimum 3 characters
   * - @MaxLength(20) - Maximum 20 characters
   * - @Matches(/^[a-zA-Z0-9_]+$/) - Only alphanumeric + underscore
   * - @IsUniqueUsername() - If provided, must not already exist in DB (async)
   *
   * @example "new_username"
   */
  @IsOptional()
  @IsString({
    message: 'Username must be a string',
  })
  @MinLength(3, {
    message: 'Username must be at least 3 characters long',
  })
  @MaxLength(20, {
    message: 'Username must not be longer than 20 characters',
  })
  @Matches(/^[a-zA-Z0-9_]+$/, {
    message: 'Username can only contain letters, numbers, and underscores',
  })
  @IsUniqueUsername({
    message: 'Username already exists. Please use a different username.',
  })
  username?: string;

  /**
   * User's first name (optional)
   *
   * Can be updated to a new first name, or cleared by sending null/empty.
   *
   * @type {string | undefined}
   * @validation
   * - @IsOptional() - Not required
   * - @IsString() - If provided, must be a string
   * - @MaxLength(100) - Maximum 100 characters
   *
   * @example "Johnny"
   */
  @IsOptional()
  @IsString({
    message: 'First name must be a string',
  })
  @MaxLength(100, {
    message: 'First name must not be longer than 100 characters',
  })
  first_name?: string;

  /**
   * User's last name (optional)
   *
   * Can be updated to a new last name, or cleared by sending null/empty.
   *
   * @type {string | undefined}
   * @validation
   * - @IsOptional() - Not required
   * - @IsString() - If provided, must be a string
   * - @MaxLength(100) - Maximum 100 characters
   *
   * @example "Smith"
   */
  @IsOptional()
  @IsString({
    message: 'Last name must be a string',
  })
  @MaxLength(100, {
    message: 'Last name must not be longer than 100 characters',
  })
  last_name?: string;
}
