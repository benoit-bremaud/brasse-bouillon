import { IsString, MinLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Change Password DTO
 *
 * Used for password change requests.
 * Requires the old password for verification and new password with strong requirements.
 *
 * @class ChangePasswordDto
 */
export class ChangePasswordDto {
  /**
   * Current password (for verification)
   *
   * The user's current password to verify their identity before changing it.
   *
   * @type {string}
   * @example "OldPassword123!"
   */
  @ApiProperty({
    example: 'OldPassword123!',
    description: 'Current password (for verification)',
    type: String,
  })
  @IsString({ message: 'Old password must be a string' })
  old_password: string;

  /**
   * New password
   *
   * Must meet security requirements:
   * - Minimum 8 characters
   * - At least one uppercase letter
   * - At least one lowercase letter
   * - At least one number
   * - At least one special character (!@#$%^&*)
   *
   * @type {string}
   * @example "NewPassword123!"
   */
  @ApiProperty({
    example: 'NewPassword123!',
    description:
      'New password (min 8 chars, must contain uppercase, lowercase, number, and special char)',
    type: String,
    minLength: 8,
  })
  @IsString({ message: 'New password must be a string' })
  @MinLength(8, {
    message: 'New password must be at least 8 characters long',
  })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/, {
    message:
      'New password must contain uppercase, lowercase, number, and special character (!@#$%^&*)',
  })
  new_password: string;
}
