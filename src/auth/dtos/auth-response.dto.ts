import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../../common/enums/role.enum';

/**
 * Auth Response DTO
 *
 * Response from login endpoint.
 * Contains JWT token and user data (without password).
 *
 * @class AuthResponseDto
 *
 * @example
 * {
 *   "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
 *   "user": {
 *     "id": "550e8400-e29b-41d4-a716-446655440000",
 *     "email": "john@example.com",
 *     "username": "john_doe",
 *     "first_name": "John",
 *     "last_name": "Doe",
 *     "role": "user",
 *     "is_active": true,
 *     "created_at": "2025-11-01T23:31:00Z",
 *     "updated_at": "2025-11-01T23:31:00Z"
 *   }
 * }
 */
export class AuthResponseDto {
  /**
   * JWT access token
   *
   * Use this token in the Authorization header for protected routes:
   * Authorization: Bearer <access_token>
   *
   * @example "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
   */
  @ApiProperty({
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1NTBlODQwMC1lMjliLTQxZDQtYTcxNi00NDY2NTU0NDAwMDAiLCJpYXQiOjE3MzA1NDAwODcsImV4cCI6MTczMDU0MzY4N30.abc123...',
    description: 'JWT access token for Authorization header',
    type: String,
  })
  access_token: string;

  /**
   * User data (without password)
   *
   * @type {object}
   * @properties
   * - id: User UUID
   * - email: User email
   * - username: User username
   * - first_name: User first name
   * - last_name: User last name
   * - role: User role
   * - is_active: Account status
   * - created_at: Account creation date
   * - updated_at: Last update date
   */
  @ApiProperty({
    description: 'User data (without password)',
    example: {
      id: '550e8400-e29b-41d4-a716-446655440000',
      email: 'john@example.com',
      username: 'john_doe',
      first_name: 'John',
      last_name: 'Doe',
      role: UserRole,
      is_active: true,
      created_at: '2025-11-01T23:31:00Z',
      updated_at: '2025-11-01T23:31:00Z',
    },
  })
  user: {
    id: string;
    email: string;
    username: string;
    first_name?: string;
    last_name?: string;
    role: UserRole;
    is_active: boolean;
    created_at: Date;
    updated_at: Date;
  };
}
