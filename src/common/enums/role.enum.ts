/**
 * User Role Enum
 *
 * Defines the available roles in the application.
 * Used for Role-Based Access Control (RBAC).
 *
 * @enum {string}
 *
 * @example
 * export enum UserRole {
 *   ADMIN = 'admin',      // Full access to all resources
 *   USER = 'user',        // Limited access (own resources only)
 *   MODERATOR = 'moderator' // Moderate content
 * }
 */
export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  MODERATOR = 'moderator',
}
