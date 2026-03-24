import { ApiProperty } from '@nestjs/swagger';

/**
 * Change Password Response DTO
 *
 * Response returned after successfully changing password
 *
 * @class ChangePasswordResponseDto
 */
export class ChangePasswordResponseDto {
  @ApiProperty({
    example: 'Password changed successfully',
    description: 'Success message',
    type: String,
  })
  message: string;
}
