import { Exclude } from 'class-transformer';

/**
 * User Response DTO
 *
 * Data Transfer Object for user responses.
 * Automatically excludes the password_hash field from all responses.
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
 * // password_hash will be removed automatically
 */
export class UserResponseDto {
  /**
   * Unique identifier (UUID)
   */
  id: string;

  /**
   * User's email address (unique)
   */
  email: string;

  /**
   * User's username (unique)
   */
  username: string;

  /**
   * User's first name
   */
  first_name: string;

  /**
   * User's last name
   */
  last_name: string;

  /**
   * Account status flag
   */
  is_active: boolean;

  /**
   * Timestamp of user creation
   */
  created_at: Date;

  /**
   * Timestamp of last update
   */
  updated_at: Date;

  /**
   * Password hash - EXCLUDED from responses
   *
   * This field is marked with @Exclude() to ensure it's never
   * sent to the client, providing an additional layer of security.
   */
  @Exclude()
  password_hash?: string;
}
