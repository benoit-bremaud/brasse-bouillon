import { NotFoundException } from '@nestjs/common';

/**
 * User Not Found Exception
 *
 * Thrown when attempting to retrieve, update, or delete a user that does not exist
 *
 * HTTP Status: 404 Not Found
 * Response body:
 * {
 *   "statusCode": 404,
 *   "message": "User not found",
 *   "timestamp": "2025-11-02T12:42:00Z",
 *   "path": "/api/users/123"
 * }
 */
export class UserNotFoundException extends NotFoundException {
  constructor() {
    super('User not found');
  }
}
