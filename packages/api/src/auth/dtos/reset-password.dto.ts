import {
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

/**
 * Reset Password DTO
 *
 * Body of `POST /auth/reset-password`. The user submits the raw token
 * received by email plus the new password. The service hashes the
 * raw token and looks it up against `users.password_reset_token_hash`,
 * verifies the expiry, then writes the new password.
 *
 * Password rules match the existing ChangePasswordDto / CreateUserDto
 * (min 8 chars + 1 uppercase + 1 lowercase + 1 digit + 1 special char
 * in `!@#$%^&*`) so a user cannot use the reset flow as a backdoor to
 * set a weaker password than every other password-setting flow allows.
 */
export class ResetPasswordDto {
  @ApiProperty({
    description: 'Raw reset token received by email (single-use, 1h lifetime)',
    example: '6f4e5b2a-7c3d-4f10-9b3e-1c8f7d2a3e0f',
  })
  @IsString({ message: 'Token must be a string' })
  @IsNotEmpty({ message: 'Token is required' })
  @MaxLength(255, { message: 'Token is too long' })
  token: string;

  @ApiProperty({
    description:
      'New password (min 8 chars, must contain uppercase, lowercase, number, and special char in !@#$%^&*)',
    example: 'NewSecurePass123!',
    minLength: 8,
    maxLength: 128,
  })
  @IsString({ message: 'New password must be a string' })
  @IsNotEmpty({ message: 'New password is required' })
  @MinLength(8, { message: 'New password must be at least 8 characters long' })
  @MaxLength(128, { message: 'New password must not exceed 128 characters' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/, {
    message:
      'New password must contain uppercase, lowercase, number, and special character (!@#$%^&*)',
  })
  new_password: string;
}
