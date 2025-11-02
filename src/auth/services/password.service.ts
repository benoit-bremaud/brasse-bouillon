import * as bcrypt from 'bcrypt';

import { Injectable } from '@nestjs/common';

/**
 * Password Service
 *
 * Handles password hashing and verification using bcrypt.
 * Never stores plain text passwords in the database.
 *
 * @class PasswordService
 *
 * @example
 * const hashedPassword = await passwordService.hashPassword('SecurePass123!');
 * const isMatch = await passwordService.comparePassword('SecurePass123!', hashedPassword);
 */
@Injectable()
export class PasswordService {
  /**
   * Number of salt rounds for bcrypt
   * Higher = more secure but slower
   * Recommended: 10-12 for production
   *
   * @private
   * @type {number}
   */
  private readonly saltRounds: number = 10;

  /**
   * Hash a plain text password
   *
   * Converts a plain password into a bcrypt hash.
   * The hash includes the salt, so each password hash is unique even for identical passwords.
   *
   * @param {string} password - Plain text password to hash
   *
   * @returns {Promise<string>} Bcrypt hash (can be stored in database)
   *
   * @example
   * const hashedPassword = await passwordService.hashPassword('SecurePass123!');
   * // Output: $2b$10$...long hash string...
   *
   * @throws Will throw if password is not a string or hashing fails
   */
  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.saltRounds);
  }

  /**
   * Compare a plain password with a hash
   *
   * Verifies if a plain text password matches a previously hashed password.
   * Used during login to validate user credentials.
   *
   * @param {string} plainPassword - Plain text password from user input
   * @param {string} hashedPassword - Hashed password from database
   *
   * @returns {Promise<boolean>} True if passwords match, false otherwise
   *
   * @example
   * const match = await passwordService.comparePassword(
   *   'SecurePass123!',
   *   '$2b$10$...hash from db...'
   * );
   * // Output: true or false
   */
  async comparePassword(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }
}
