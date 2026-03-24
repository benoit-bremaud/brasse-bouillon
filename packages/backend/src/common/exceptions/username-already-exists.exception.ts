import { ConflictException } from '@nestjs/common';

/**
 * Username Already Exists Exception
 *
 * Thrown when attempting to create/register a user with a username that is already registered
 *
 * HTTP Status: 409 Conflict
 * Response body:
 * {
 *   "statusCode": 409,
 *   "message": "Username is already taken",
 *   "timestamp": "2025-11-02T12:40:00Z",
 *   "path": "/api/users"
 * }
 */
export class UsernameAlreadyExistsException extends ConflictException {
  constructor() {
    super('Username is already taken');
  }
}
