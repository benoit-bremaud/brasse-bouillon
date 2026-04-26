import { ApiProperty } from '@nestjs/swagger';

/**
 * Forgot Password Response DTO
 *
 * Returned by `POST /auth/forgot-password` whether or not the email
 * exists. The response is intentionally generic to prevent account
 * enumeration ("if I get a different message, the email is registered").
 */
export class ForgotPasswordResponseDto {
  @ApiProperty({
    description: 'Generic acknowledgment message',
    example: 'If an account exists for that email, a reset link has been sent.',
  })
  message: string;
}
