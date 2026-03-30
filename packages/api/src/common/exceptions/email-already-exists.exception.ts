import { ConflictException } from '@nestjs/common';

/**
 * Email Already Exists Exception
 *
 * Thrown when attempting to create/register a user with an email that is already registered
 *
 * HTTP Status: 409 Conflict
 * Response body:
 * {
 *   "statusCode": 409,
 *   "message": "Email is already registered",
 *   "timestamp": "2025-11-02T12:38:00Z",
 *   "path": "/api/users"
 * }
 */
export class EmailAlreadyExistsException extends ConflictException {
  constructor() {
    super('Email is already registered');
  }
}
