import { Exclude } from 'class-transformer';
import { UserRole } from '../../common/enums/role.enum';

/**
 * User Response DTO
 *
 * Data Transfer Object for user responses.
 * Automatically excludes the password_hash field from all responses.
 *
 * Uses class-transformer @Exclude() decorator to ensure sensitive
 * data (password_hash) is never exposed to the API consumer.
 *
 * @class UserResponseDto
 * @description
 * This DTO is used when returning user data to the client.
 * The @Exclude() decorator ensures the password_hash is never
 * exposed to the API consumer, even if it's present in the database object.
 *
 * @example
 * // When user data is transformed:
 * const userResponse = plainToClass(UserResponseDto, dbUser);
 * // password_hash will be removed automatically, but role will be included
 *
 * @example
 * // API Response:
 * {
 *   "id": "550e8400-e29b-41d4-a716-446655440000",
 *   "email": "john@example.com",
 *   "username": "john_doe",
 *   "first_name": "John",
 *   "last_name": "Doe",
 *   "role": "user",
 *   "is_active": true,
 *   "created_at": "2025-11-02T22:52:55Z",
 *   "updated_at": "2025-11-02T22:52:55Z"
 * }
 */
export class UserResponseDto {
  /**
   * Unique identifier (UUID)
   *
   * @type {string}
   * @example "550e8400-e29b-41d4-a716-446655440000"
   */
  id: string;

  /**
   * User's email address (unique)
   *
   * @type {string}
   * @example "john@example.com"
   */
  email: string;

  /**
   * User's username (unique)
   *
   * @type {string}
   * @example "john_doe"
   */
  username: string;

  /**
   * User's first name
   *
   * @type {string | null}
   * @example "John"
   */
  first_name: string;

  /**
   * User's last name
   *
   * @type {string | null}
   * @example "Doe"
   */
  last_name: string;

  /**
   * User's role for Role-Based Access Control (RBAC)
   *
   * Determines what operations the user can perform:
   * - ADMIN: Full access to all resources
   * - USER: Limited access (own resources only)
   * - MODERATOR: Can moderate content
   *
   * @type {UserRole}
   * @enum {string} 'admin' | 'user' | 'moderator'
   * @default 'user'
   * @example "user"
   *
   * @see UserRole enum for available roles
   */
  role: UserRole;

  /**
   * Account status flag
   *
   * @type {boolean}
   * @example true
   */
  is_active: boolean;

  /**
   * Timestamp of user creation
   *
   * @type {Date}
   * @example "2025-11-02T22:52:55.000Z"
   */
  created_at: Date;

  /**
   * Timestamp of last update
   *
   * @type {Date}
   * @example "2025-11-02T22:52:55.000Z"
   */
  updated_at: Date;

  /**
   * Password hash - EXCLUDED from responses
   *
   * This field is marked with @Exclude() to ensure it's never
   * sent to the client, providing an additional layer of security.
   *
   * @type {string | undefined}
   * @private
   * @security This is never exposed to API consumers
   */
  @Exclude()
  password_hash?: string;
}
