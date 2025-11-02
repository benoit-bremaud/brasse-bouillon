import {
  IsEmail,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';
import { IsUniqueEmail } from '../validators/is-unique-email.validator';
import { IsUniqueUsername } from '../validators/is-unique-username.validator';

/**
 * Create User DTO
 *
 * Data Transfer Object for creating a new user.
 * Validates all required and optional fields for user creation.
 * Includes uniqueness validation for email and username.
 *
 * @class CreateUserDto
 *
 * @description
 * This DTO is used when a client sends a request to create a new user.
 * All fields are validated automatically by NestJS using class-validator.
 *
 * Validation rules:
 * - email: Required, must be valid email format, max 255 chars, UNIQUE in DB
 * - username: Required, 3-20 chars, alphanumeric + underscore only, UNIQUE in DB
 * - password: Required, 8+ chars, must contain uppercase, lowercase, number, and special char
 * - first_name: Optional, max 100 chars
 * - last_name: Optional, max 100 chars
 *
 * @example
 * // Valid request body
 * {
 *   "email": "john@example.com",
 *   "username": "john_doe",
 *   "password": "SecurePassword123!",
 *   "first_name": "John",
 *   "last_name": "Doe"
 * }
 *
 * @example
 * // Invalid request body - will be rejected
 * {
 *   "email": "invalid-email",  // ❌ Not an email
 *   "username": "ab",          // ❌ Too short (min 3)
 *   "password": "weak"         // ❌ No uppercase, number, or special char
 * }
 *
 * @example
 * // Invalid - duplicate email
 * {
 *   "email": "john@example.com",  // ❌ Already exists in DB
 *   "username": "new_user",
 *   "password": "SecurePassword123!"
 * }
 */
export class CreateUserDto {
  /**
   * User's email address
   *
   * @type {string}
   * @validation
   * - @IsEmail() - Must be valid email format
   * - @IsUniqueEmail() - Must not already exist in database (async)
   * - @MaxLength(255) - Maximum 255 characters
   *
   * @example "john@example.com"
   */
  @ApiProperty({
    example: 'john@example.com',
    description: 'User email address (must be unique)',
    type: String,
  })
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
  email: string;

  /**
   * User's username
   *
   * Must be unique in the database.
   * Only alphanumeric characters and underscores are allowed.
   *
   * @type {string}
   * @validation
   * - @IsString() - Must be a string
   * - @MinLength(3) - Minimum 3 characters
   * - @MaxLength(20) - Maximum 20 characters
   * - @Matches(/^[a-zA-Z0-9_]+$/) - Only alphanumeric + underscore
   * - @IsUniqueUsername() - Must not already exist in database (async)
   *
   * @example "john_doe"
   */
  @ApiProperty({
    example: 'john_doe',
    description:
      'User username (3-20 chars, alphanumeric + underscore, must be unique)',
    type: String,
    minLength: 3,
    maxLength: 20,
  })
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
  username: string;

  /**
   * User's password (plain text)
   *
   * Will be hashed with bcrypt before storing.
   * Must meet strong password requirements:
   * - At least 8 characters
   * - At least 1 uppercase letter
   * - At least 1 lowercase letter
   * - At least 1 number
   * - At least 1 special character (!@#$%^&*)
   *
   * @type {string}
   * @validation
   * - @IsString() - Must be a string
   * - @MinLength(8) - Minimum 8 characters
   * - @Matches() - Must contain uppercase, lowercase, number, special char
   *
   * @example "SecurePassword123!"
   */
  @ApiProperty({
    example: 'SecurePassword123!',
    description:
      'Password (min 8 chars, uppercase, lowercase, number, special char)',
    type: String,
    minLength: 8,
  })
  @IsString({
    message: 'Password must be a string',
  })
  @MinLength(8, {
    message: 'Password must be at least 8 characters long',
  })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    {
      message:
        'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)',
    },
  )
  password: string;

  /**
   * User's first name (optional)
   *
   * @type {string | undefined}
   * @validation
   * - @IsOptional() - Not required
   * - @IsString() - If provided, must be a string
   * - @MaxLength(100) - Maximum 100 characters
   *
   * @example "John"
   */
  @ApiProperty({
    example: 'John',
    description: 'User first name (optional)',
    type: String,
    maxLength: 100,
    required: false,
  })
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
   * @type {string | undefined}
   * @validation
   * - @IsOptional() - Not required
   * - @IsString() - If provided, must be a string
   * - @MaxLength(100) - Maximum 100 characters
   *
   * @example "Doe"
   */
  @ApiProperty({
    example: 'Doe',
    description: 'User last name (optional)',
    type: String,
    maxLength: 100,
    required: false,
  })
  @IsOptional()
  @IsString({
    message: 'Last name must be a string',
  })
  @MaxLength(100, {
    message: 'Last name must not be longer than 100 characters',
  })
  last_name?: string;
}
