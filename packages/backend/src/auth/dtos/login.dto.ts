import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

/**
 * Login DTO
 *
 * Data Transfer Object for user login.
 * Used in POST /auth/login endpoint.
 *
 * @class LoginDto
 *
 * @example
 * {
 *   "email": "john@example.com",
 *   "password": "SecurePassword123!"
 * }
 */
export class LoginDto {
  /**
   * User's email address
   *
   * @example "john@example.com"
   * @required
   */
  @ApiProperty({
    example: 'john@example.com',
    description: 'User email address',
    type: String,
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  /**
   * User's password (plain text)
   *
   * @example "SecurePassword123!"
   * @required
   */
  @ApiProperty({
    example: 'SecurePassword123!',
    description: 'User password',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  password: string;
}
