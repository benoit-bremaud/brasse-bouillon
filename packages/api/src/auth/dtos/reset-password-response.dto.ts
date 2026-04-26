import { ApiProperty } from '@nestjs/swagger';

/**
 * Reset Password Response DTO
 *
 * Returned by `POST /auth/reset-password` on success. The user is
 * expected to log in again with the new password (the existing
 * session, if any, is not auto-renewed).
 */
export class ResetPasswordResponseDto {
  @ApiProperty({
    description: 'Confirmation message',
    example: 'Password has been reset successfully. Please log in.',
  })
  message: string;
}
