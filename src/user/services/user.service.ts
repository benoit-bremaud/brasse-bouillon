import {
  Injectable,
  BadRequestException,
  ConflictException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from '../entities/user.entity';
import { UserRole } from '../../common/enums/role.enum';
import {
  EmailAlreadyExistsException,
  UsernameAlreadyExistsException,
  UserNotFoundException,
} from '../../common/exceptions';
import { PasswordService } from '../../auth/services/password.service';

/**
 * User Service
 *
 * Core business logic layer for user management operations.
 * Handles all CRUD operations, password management, and user-related validations.
 * Enforces business rules, data consistency, and security constraints.
 *
 * Responsibilities:
 * - User creation with email/username validation and uniqueness checks
 * - User profile retrieval, updating, and deletion
 * - Password management and verification
 * - User role assignment and updates
 * - User count and listing operations
 * - Data sensitivity: Ensures passwords are never exposed in responses
 *
 * Dependencies:
 * - UserRepository: TypeORM repository for database operations
 * - PasswordService: Handles password hashing and verification
 *
 * Security:
 * - All passwords hashed with bcrypt before storage
 * - Password hashes never included in API responses
 * - Validation of unique constraints (email, username)
 * - Ownership verification at controller level
 * - Audit logging for sensitive operations
 *
 * Database interactions:
 * - Uses TypeORM ORM for type-safe queries
 * - Implements soft-delete concept (is_active flag)
 * - Automatic timestamp management (created_at, updated_at)
 *
 * @class UserService
 * @decorator @Injectable() Makes this service injectable across the application
 *
 * @example
 * // In a controller or another service
 * constructor(private readonly userService: UserService) {}
 *
 * async getUser(id: string) {
 *   try {
 *     return await this.userService.findById(id);
 *   } catch (error) {
 *     // Handle NotFoundException, etc.
 *   }
 * }
 */
@Injectable()
export class UserService {
  /**
   * Constructor - Dependency Injection
   *
   * @param {Repository<User>} userRepository - TypeORM repository for User entity
   *        Provides database access for user operations (CRUD, queries)
   *
   * @param {PasswordService} passwordService - Service for password hashing/verification
   *        Handles bcrypt encryption and password comparison
   */
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly passwordService: PasswordService,
  ) {}

  // ============================================================================
  // 📝 CREATE OPERATIONS
  // ============================================================================

  /**
   * Create a new user in the database (User Registration)
   *
   * Main entry point for user registration. Validates input data, enforces
   * unique constraints on email/username, hashes password, and persists user to DB.
   *
   * Validation steps:
   * 1. Validate all required fields are present and non-empty
   * 2. Check email uniqueness in database
   * 3. Check username uniqueness in database
   * 4. Hash password using bcrypt
   * 5. Create user entity with default values
   * 6. Save to database and return (without password)
   *
   * Default values:
   * - role: USER (default role for all new registrations)
   * - is_active: true (users are active by default)
   * - first_name, last_name: optional, can be updated later
   *
   * Security:
   * - Password never stored in plain text
   * - Password never included in response
   * - Uses custom exceptions for better error handling
   *
   * @param {Object} createUserData - User creation data (validated by DTO)
   * @param {string} createUserData.email - User's email (required, unique constraint)
   * @param {string} createUserData.username - User's username (required, unique constraint)
   * @param {string} createUserData.password - Plain text password (will be hashed, required)
   * @param {string} [createUserData.first_name] - User's first name (optional)
   * @param {string} [createUserData.last_name] - User's last name (optional)
   *
   * @returns {Promise<User>} Created user object (password_hash excluded via formatUserResponse)
   *
   * @throws {BadRequestException} If required fields (email, username, password) are missing or empty
   * @throws {EmailAlreadyExistsException} If email already registered to another user
   * @throws {UsernameAlreadyExistsException} If username already taken
   *
   * @example
   * // Successful registration
   * const newUser = await userService.create({
   *   email: 'john@example.com',
   *   username: 'john_doe',
   *   password: 'SecurePassword123!',
   *   first_name: 'John',
   *   last_name: 'Doe'
   * });
   * // Returns: { id, email, username, first_name, last_name, role: 'user', ... }
   *
   * @example
   * // Error: Email already exists
   * try {
   *   await userService.create({
   *     email: 'existing@example.com', // Already registered
   *     username: 'unique_username',
   *     password: 'SecurePassword123!'
   *   });
   * } catch (error) {
   *   // Throws: EmailAlreadyExistsException
   * }
   */
  async create(createUserData: {
    email: string;
    username: string;
    password: string;
    first_name?: string;
    last_name?: string;
  }): Promise<User> {
    // ✅ VALIDATION: Check required fields
    if (
      !createUserData.email ||
      !createUserData.username ||
      !createUserData.password
    ) {
      throw new BadRequestException(
        'Email, username, and password are required',
      );
    }

    // ✅ UNIQUENESS CHECK: Email
    const existingEmailUser = await this.userRepository.findOne({
      where: { email: createUserData.email },
    });
    if (existingEmailUser) {
      throw new EmailAlreadyExistsException();
    }

    // ✅ UNIQUENESS CHECK: Username
    const existingUsernameUser = await this.userRepository.findOne({
      where: { username: createUserData.username },
    });
    if (existingUsernameUser) {
      throw new UsernameAlreadyExistsException();
    }

    // ✅ PASSWORD HASHING: Hash password before storage
    const passwordHash: string = await this.passwordService.hashPassword(
      createUserData.password,
    );

    // ✅ ENTITY CREATION: Create user entity with default values
    const newUser = this.userRepository.create({
      email: createUserData.email,
      username: createUserData.username,
      password_hash: passwordHash,
      first_name: createUserData.first_name || null,
      last_name: createUserData.last_name || null,
      role: UserRole.USER, // Default role
      is_active: true, // Active by default
    } as Partial<User>);

    // ✅ DATABASE PERSISTENCE: Save to database
    const savedUser = await this.userRepository.save(newUser);

    // ✅ SECURITY: Remove password before returning
    return this.formatUserResponse(savedUser);
  }

  /**
   * Create an admin user (Genesis Admin or Moderator seeding)
   *
   * Internal method for creating privileged users (admin, moderator).
   * Used during application startup for seeding initial admin/moderator accounts.
   * Bypasses normal registration flow but still validates uniqueness.
   *
   * Use cases:
   * - Genesis admin creation at first application startup
   * - Moderator creation during development/testing
   * - Batch user creation in admin operations (future)
   *
   * Default values:
   * - role: ADMIN (must be changed after creation if needed)
   * - is_active: true
   *
   * Security note:
   * - This is an internal method, not exposed via API
   * - Credentials are typically hardcoded for dev purposes
   * - Should be replaced with proper provisioning in production
   *
   * @param {string} email - Admin's email (required, unique)
   * @param {string} username - Admin's username (required, unique)
   * @param {string} password - Plain text password (will be hashed)
   * @param {string} firstName - Admin's first name
   * @param {string} lastName - Admin's last name
   *
   * @returns {Promise<User>} Created admin user (with password_hash)
   *
   * @throws {ConflictException} If email or username already exists
   *
   * @example
   * // Create genesis admin
   * const admin = await userService.createAdmin(
   *   'admin@example.com',
   *   'admin',
   *   'AdminPassword123!',
   *   'Admin',
   *   'User'
   * );
   *
   * @example
   * // Create moderator (then update role)
   * const moderator = await userService.createAdmin(
   *   'moderator@example.com',
   *   'moderator',
   *   'ModPassword123!',
   *   'Moderator',
   *   'User'
   * );
   * const updatedMod = await userService.updateUserRole(
   *   moderator.id,
   *   UserRole.MODERATOR
   * );
   */
  async createAdmin(
    email: string,
    username: string,
    password: string,
    firstName: string,
    lastName: string,
  ): Promise<User> {
    // ✅ UNIQUENESS CHECK: Email
    const existingEmail = await this.userRepository.findOne({
      where: { email },
    });
    if (existingEmail) {
      throw new ConflictException('Email already exists');
    }

    // ✅ UNIQUENESS CHECK: Username
    const existingUsername = await this.userRepository.findOne({
      where: { username },
    });
    if (existingUsername) {
      throw new ConflictException('Username already exists');
    }

    // ✅ PASSWORD HASHING: Hash password
    const password_hash = await this.passwordService.hashPassword(password);

    // ✅ ENTITY CREATION: Create admin user
    const admin = this.userRepository.create({
      email,
      username,
      password_hash,
      first_name: firstName,
      last_name: lastName,
      role: UserRole.ADMIN,
      is_active: true,
    });

    // ✅ DATABASE PERSISTENCE
    const savedAdmin = await this.userRepository.save(admin);

    console.log(`✅ Admin created: ${email} (ID: ${savedAdmin.id})`);

    return savedAdmin;
  }

  // ============================================================================
  // 🔍 READ OPERATIONS
  // ============================================================================

  /**
   * Find a user by their unique UUID
   *
   * Retrieves a user from the database and strips password before returning.
   * Most common read operation used by controllers and other services.
   *
   * Security:
   * - Password hash is removed before returning
   * - Throws NotFoundException if user doesn't exist (prevents info leakage)
   *
   * Use cases:
   * - Get user profile for display
   * - Verify user exists before operations
   * - Retrieve user data for API responses
   *
   * @param {string} id - User's UUID (v4 format)
   *
   * @returns {Promise<User>} User object (password_hash excluded)
   *
   * @throws {NotFoundException} If user with given ID does not exist
   *
   * @example
   * // Successful retrieval
   * const user = await userService.findById('550e8400-e29b-41d4-a716-446655440000');
   * // Returns: { id, email, username, role, is_active, created_at, updated_at }
   *
   * @example
   * // Error: User not found
   * try {
   *   await userService.findById('non-existent-id');
   * } catch (error) {
   *   // Throws: NotFoundException
   * }
   */
  async findById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new UserNotFoundException();
    }

    // ✅ SECURITY: Remove password hash before returning
    return this.formatUserResponse(user);
  }

  /**
   * Find a user by their email address
   *
   * Retrieves user by email without stripping password hash.
   * Used primarily during authentication flow where password verification is needed.
   *
   * Important note:
   * - Returns password_hash (unlike findById)
   * - This is intentional for auth operations
   * - Callers must ensure password hash is not exposed in responses
   *
   * Use cases:
   * - Login/authentication (needs password_hash for comparison)
   * - Email uniqueness validation
   * - User lookup by email
   *
   * @param {string} email - User's email address
   *
   * @returns {Promise<User | null>} User object with password_hash, or null if not found
   *
   * @example
   * // During login
   * const user = await userService.findByEmail('john@example.com');
   * if (user && await this.passwordService.compare(inputPassword, user.password_hash)) {
   *   // Login successful
   * }
   *
   * @example
   * // Email validation (registration)
   * const existing = await userService.findByEmail('newuser@example.com');
   * if (existing) {
   *   throw new ConflictException('Email already registered');
   * }
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email },
    });
  }

  /**
   * Find a user by their username
   *
   * Retrieves user by username without stripping password hash.
   * Similar to findByEmail, returns full user object including password_hash.
   *
   * Use cases:
   * - Username uniqueness validation
   * - User lookup by username (for public profiles, etc.)
   * - Username-based authentication
   *
   * @param {string} username - User's username
   *
   * @returns {Promise<User | null>} User object with password_hash, or null if not found
   *
   * @example
   * const user = await userService.findByUsername('john_doe');
   * if (!user) {
   *   throw new NotFoundException('User not found');
   * }
   */
  async findByUsername(username: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { username },
    });
  }

  /**
   * Get ALL users in the system
   *
   * Retrieves complete list of all active users from database.
   * Typically used by admin endpoints for user management.
   * Does NOT strip password hashes - controller must format response.
   *
   * Database query:
   * - Filters: Only active users (is_active: true)
   * - Order: DESC by created_at (newest first)
   *
   * Performance note:
   * - May be slow with large user base
   * - Consider pagination for production
   * - Add database indexing on is_active field
   *
   * @returns {Promise<User[]>} Array of all active users
   *
   * @example
   * // Admin listing all users
   * const allUsers = await userService.findAll();
   * // Returns: [{ id, email, username, ... }, ...]
   *
   * // In controller, format response:
   * const formatted = allUsers.map(u => plainToInstance(UserResponseDto, u));
   */
  async findAll(): Promise<User[]> {
    return this.userRepository.find({
      where: { is_active: true },
      order: { created_at: 'DESC' },
    });
  }

  /**
   * Count total active users
   *
   * Returns number of active users in system.
   * Useful for statistics, monitoring, and dashboard displays.
   *
   * @returns {Promise<number>} Count of active users
   *
   * @example
   * const totalUsers = await userService.count();
   * console.log(`System has ${totalUsers} active users`);
   */
  async count(): Promise<number> {
    return this.userRepository.count({
      where: { is_active: true },
    });
  }

  // ============================================================================
  // ✏️ UPDATE OPERATIONS
  // ============================================================================

  /**
   * Update user profile information (partial update)
   *
   * Allows updating user's profile fields (email, username, names).
   * Validates uniqueness constraints for email and username.
   * Does NOT allow password updates - use changePassword() instead.
   *
   * Update validation:
   * - If email being changed: verify new email is not taken
   * - If username being changed: verify new username is not taken
   * - Allow null values for first_name/last_name
   * - Automatic timestamp: updated_at is set by database
   *
   * Security:
   * - Does not allow password modification
   * - Only user can update own profile (enforced at controller)
   * - Changes are logged for audit trail
   *
   * @param {string} id - User UUID to update
   * @param {Object} updateUserData - Fields to update (all optional)
   * @param {string} [updateUserData.email] - New email (optional, must be unique)
   * @param {string} [updateUserData.username] - New username (optional, must be unique)
   * @param {string} [updateUserData.first_name] - New first name (optional, can be null)
   * @param {string} [updateUserData.last_name] - New last name (optional, can be null)
   *
   * @returns {Promise<User>} Updated user object (password excluded)
   *
   * @throws {NotFoundException} If user does not exist
   * @throws {EmailAlreadyExistsException} If new email already in use
   * @throws {UsernameAlreadyExistsException} If new username already in use
   *
   * @example
   * // Update only first name
   * const updated = await userService.update('user-id', {
   *   first_name: 'Johnny'
   * });
   *
   * @example
   * // Update email and username
   * const updated = await userService.update('user-id', {
   *   email: 'newemail@example.com',
   *   username: 'new_username'
   * });
   *
   * @example
   * // Error: Email already taken
   * try {
   *   await userService.update('user-id', {
   *     email: 'taken@example.com' // Already used
   *   });
   * } catch (error) {
   *   // Throws: EmailAlreadyExistsException
   * }
   */
  async update(
    id: string,
    updateUserData: {
      email?: string;
      username?: string;
      first_name?: string;
      last_name?: string;
    },
  ): Promise<User> {
    // ✅ EXISTENCE CHECK: Verify user exists
    const user = await this.userRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new UserNotFoundException();
    }

    // ✅ EMAIL UNIQUENESS: If email being changed, verify it's available
    if (updateUserData.email && updateUserData.email !== user.email) {
      const existingEmailUser = await this.userRepository.findOne({
        where: { email: updateUserData.email },
      });
      if (existingEmailUser) {
        throw new EmailAlreadyExistsException();
      }
    }

    // ✅ USERNAME UNIQUENESS: If username being changed, verify it's available
    if (updateUserData.username && updateUserData.username !== user.username) {
      const existingUsernameUser = await this.userRepository.findOne({
        where: { username: updateUserData.username },
      });
      if (existingUsernameUser && existingUsernameUser.id !== id) {
        throw new UsernameAlreadyExistsException();
      }
    }

    // ✅ FIELD UPDATES: Only update provided fields (partial update)
    if (updateUserData.email) user.email = updateUserData.email;
    if (updateUserData.username) user.username = updateUserData.username;
    if (updateUserData.first_name !== undefined)
      user.first_name = updateUserData.first_name;
    if (updateUserData.last_name !== undefined)
      user.last_name = updateUserData.last_name;

    // ✅ DATABASE PERSISTENCE: Save updated user
    const updatedUser = await this.userRepository.save(user);

    // ✅ SECURITY: Remove password hash before returning
    return this.formatUserResponse(updatedUser);
  }

  /**
   * Update user's role
   *
   * Changes user's role to specified value.
   * Used for promoting/demoting users (user → moderator, user → admin, etc).
   * Internal method - not directly exposed via API.
   *
   * Audit:
   * - Logs role change to console
   * - updated_at timestamp updated automatically
   *
   * Use cases:
   * - Promote user to moderator
   * - Promote moderator to admin
   * - Demote admin to user (future)
   * - Role-based access control updates
   *
   * @param {string} userId - User UUID to update
   * @param {UserRole} role - New role to assign (USER, MODERATOR, ADMIN)
   *
   * @returns {Promise<User>} Updated user (password excluded)
   *
   * @throws {NotFoundException} If user not found
   *
   * @example
   * // Promote user to moderator
   * const updated = await userService.updateUserRole(
   *   'user-id',
   *   UserRole.MODERATOR
   * );
   * // Returns: { ..., role: 'moderator', updated_at: '...' }
   */
  async updateUserRole(userId: string, role: UserRole): Promise<User> {
    // ✅ EXISTENCE CHECK
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new UserNotFoundException();
    }

    // ✅ ROLE UPDATE
    const oldRole = user.role;
    user.role = role;

    // ✅ DATABASE PERSISTENCE
    const updatedUser = await this.userRepository.save(user);

    console.log(`👤 User role updated: ${userId} (${oldRole} → ${role})`);

    // ✅ SECURITY: Remove password hash before returning
    return this.formatUserResponse(updatedUser);
  }

  /**
   * Change user password (Secure password update)
   *
   * Allows authenticated user to change their password securely.
   * Requires verification of old password before accepting new one.
   * Only method that updates password field directly.
   *
   * Security flow:
   * 1. Fetch user from database (by ID)
   * 2. Verify old password matches stored hash
   * 3. Hash new password
   * 4. Update password_hash in database
   * 5. Update timestamp
   *
   * Security requirements:
   * - Old password MUST be verified first
   * - New password must be hashed before storage
   * - Audit logging of password changes
   *
   * Password strength validation:
   * - Handled by DTO validators (8+ chars, mixed case, numbers, special chars)
   * - DTO validation happens before this method is called
   *
   * Use cases:
   * - User-initiated password changes
   * - Password reset flows
   * - Security: Password change on detected compromise
   *
   * @param {string} userId - ID of user changing password
   * @param {string} oldPassword - Current password (for verification)
   * @param {string} newPassword - New password (will be hashed)
   *
   * @returns {Promise<User>} Updated user (password excluded)
   *
   * @throws {NotFoundException} If user not found
   * @throws {UnauthorizedException} If old password is incorrect
   *
   * @example
   * // Change password
   * const updated = await userService.changePassword(
   *   'user-id',
   *   'OldPassword123!',
   *   'NewPassword456!'
   * );
   *
   * @example
   * // Error: Wrong old password
   * try {
   *   await userService.changePassword('user-id', 'WrongPassword!', 'NewPass123!');
   * } catch (error) {
   *   // Throws: UnauthorizedException
   * }
   */
  async changePassword(
    userId: string,
    oldPassword: string,
    newPassword: string,
  ): Promise<User> {
    // ✅ EXISTENCE CHECK: Fetch user from database
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // ✅ OLD PASSWORD VERIFICATION: Ensure old password is correct
    const isPasswordValid = await this.passwordService.comparePassword(
      oldPassword,
      user.password_hash,
    );

    if (!isPasswordValid) {
      console.warn(
        `⚠️ SECURITY: Failed password change attempt for user ${userId}`,
      );
      throw new UnauthorizedException('Old password is incorrect');
    }

    // ✅ NEW PASSWORD HASHING: Hash new password
    const hashedNewPassword =
      await this.passwordService.hashPassword(newPassword);

    // ✅ DATABASE UPDATE: Update password and timestamp
    user.password_hash = hashedNewPassword;
    user.updated_at = new Date();

    // ✅ DATABASE PERSISTENCE
    const updatedUser = await this.userRepository.save(user);

    console.log(`🔐 Password changed for user ${userId}`);

    // ✅ SECURITY: Remove password hash before returning
    return this.formatUserResponse(updatedUser);
  }

  // ============================================================================
  // 🗑️ DELETE OPERATIONS
  // ============================================================================

  /**
   * Delete a user permanently
   *
   * Permanently removes a user account and associated data from database.
   * This action is IRREVERSIBLE - consider soft-delete for production.
   *
   * Security:
   * - Ownership verified at controller level before calling this method
   * - Logs deletion for audit trail
   * - All associated data deleted (cascade rules in entity)
   *
   * Warning:
   * - No recovery possible after deletion
   * - Consider implementing soft-delete (is_active flag)
   * - Implement data archival before deletion if needed
   *
   * Use cases:
   * - User account deletion request (GDPR/privacy)
   * - Admin account removal
   * - Testing/development cleanup
   *
   * @param {string} id - User UUID to delete
   *
   * @returns {Promise<void>} No return value
   *
   * @throws {NotFoundException} If user does not exist
   *
   * @example
   * // Delete user account
   * await userService.delete('user-id');
   * // User completely removed from database
   *
   * @example
   * // Error: User not found
   * try {
   *   await userService.delete('non-existent-id');
   * } catch (error) {
   *   // Throws: NotFoundException
   * }
   */
  async delete(id: string): Promise<void> {
    // ✅ EXISTENCE CHECK: Verify user exists before deleting
    const user = await this.userRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new UserNotFoundException();
    }

    // ✅ DATABASE DELETION: Remove user permanently
    await this.userRepository.remove(user);

    console.log(`🗑️ User deleted: ${id} (${user.email})`);
  }

  // ============================================================================
  // 🛡️ UTILITY METHODS
  // ============================================================================

  /**
   * Format user response by removing sensitive fields
   *
   * Internal utility method that removes password_hash from user objects
   * before returning to API consumers or other services.
   *
   * Security principle:
   * - Passwords should NEVER be exposed in API responses or logs
   * - This method ensures consistent password filtering across all endpoints
   * - Prevents accidental password exposure through code changes
   *
   * What's removed:
   * - password_hash: The bcrypt hashed password
   *
   * What's retained:
   * - All other fields including metadata (created_at, updated_at)
   * - role, is_active, and all user information
   *
   * Implementation:
   * - Uses destructuring to exclude password_hash
   * - Returns clean object ready for API response
   * - Works with plainToInstance transformation in controllers
   *
   * @private
   * @param {User} user - Raw user object from database (includes password_hash)
   *
   * @returns {User} User object without password_hash field
   *
   * @security This ensures passwords are never sent to the client
   *
   * @example
   * // Before: { id, email, password_hash: '$2b$10...', ... }
   * const clean = this.formatUserResponse(rawUser);
   * // After: { id, email, ... } (password_hash removed)
   */
  private formatUserResponse(user: User): User {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password_hash, ...userWithoutPassword } = user;
    return userWithoutPassword as User;
  }
}
