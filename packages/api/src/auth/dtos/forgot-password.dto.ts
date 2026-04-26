import { IsEmail, IsNotEmpty } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

/**
 * Forgot Password DTO
 *
 * Body of `POST /auth/forgot-password`. The endpoint always returns
 * 200 OK regardless of whether the email exists, to avoid account
 * enumeration leaks. The DTO only validates the shape of the email
 * itself.
 */
export class ForgotPasswordDto {
  @ApiProperty({
    description: 'Email of the account that needs a password reset',
    example: 'john@example.com',
  })
  @IsEmail({}, { message: 'Email must be valid' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;
}
