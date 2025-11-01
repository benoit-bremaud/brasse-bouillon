import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import {
  EmailAlreadyExistsException,
  UsernameAlreadyExistsException,
  UserNotFoundException,
} from '../../common/exceptions';

/**
 * User Service
 *
 * Handles all business logic related to user management.
 * Provides methods for creating, reading, updating, and deleting users.
 * Manages user authentication data and ensures data consistency.
 *
 * @class UserService
 * @decorator @Injectable() Makes this service injectable across the application
 *
 * @example
 * // In a controller
 * constructor(private readonly userService: UserService) {}
 *
 * async getUser(id: string) {
 *   return this.userService.findById(id);
 * }
 */
@Injectable()
export class UserService {
  /**
   * Constructor - Injects the User repository
   *
   * @param {Repository<User>} userRepository - TypeORM repository for User entity
   */
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /**
   * Create a new user in the database
   *
   * Validates input data, checks for duplicate email/username,
   * hashes the password, and stores the user.
   *
   * @async
   * @param {Object} createUserData - User creation data
   * @param {string} createUserData.email - User's email (must be unique)
   * @param {string} createUserData.username - User's username (must be unique)
   * @param {string} createUserData.password - Plain text password (will be hashed)
   * @param {string} [createUserData.first_name] - User's first name (optional)
   * @param {string} [createUserData.last_name] - User's last name (optional)
   *
   * @returns {Promise<User>} The newly created user (without password)
   *
   * @throws {BadRequestException} If required fields are missing
   * @throws {ConflictException} If email or username already exists
   *
   * @example
   * const newUser = await userService.create({
   *   email: 'john@example.com',
   *   username: 'john_doe',
   *   password: 'securePassword123!',
   *   first_name: 'John',
   *   last_name: 'Doe'
   * });
   */
  async create(createUserData: {
    email: string;
    username: string;
    password: string;
    first_name?: string;
    last_name?: string;
  }): Promise<User> {
    // Validate required fields
    if (
      !createUserData.email ||
      !createUserData.username ||
      !createUserData.password
    ) {
      throw new BadRequestException(
        'Email, username, and password are required',
      );
    }

    // Check if email already exists
    const existingEmailUser = await this.userRepository.findOne({
      where: { email: createUserData.email },
    });
    if (existingEmailUser) {
      throw new EmailAlreadyExistsException();
    }

    // Check if username already exists
    const existingUsernameUser = await this.userRepository.findOne({
      where: { username: createUserData.username },
    });
    if (existingUsernameUser) {
      throw new UsernameAlreadyExistsException();
    }

    // Hash the password before storing
    const passwordHash = await User.hashPassword(createUserData.password);

    // Create new user instance
    const newUser = this.userRepository.create({
      email: createUserData.email,
      username: createUserData.username,
      password_hash: passwordHash,
      first_name: createUserData.first_name,
      last_name: createUserData.last_name,
      is_active: true,
    });

    // Save user to database
    const savedUser = await this.userRepository.save(newUser);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return this.formatUserResponse(savedUser);
  }

  /**
   * Find a user by their unique ID
   *
   * @async
   * @param {string} id - User's UUID
   *
   * @returns {Promise<User>} The user object (without password)
   *
   * @throws {NotFoundException} If user does not exist
   *
   * @example
   * const user = await userService.findById('550e8400-e29b-41d4-a716-446655440000');
   */
  async findById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new UserNotFoundException();
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return this.formatUserResponse(user);
  }

  /**
   * Find a user by their email address
   *
   * Useful for login operations. Does NOT remove password hash
   * because this is typically called during authentication.
   *
   * @async
   * @param {string} email - User's email address
   *
   * @returns {Promise<User | null>} The user object or null if not found
   *
   * @example
   * const user = await userService.findByEmail('john@example.com');
   * if (user && await user.validatePassword(inputPassword)) {
   *   // Login successful
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
   * Useful for profile lookups. Does NOT remove password hash
   * to allow flexibility in different use cases.
   *
   * @async
   * @param {string} username - User's username
   *
   * @returns {Promise<User | null>} The user object or null if not found
   *
   * @example
   * const user = await userService.findByUsername('john_doe');
   */
  async findByUsername(username: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { username },
    });
  }

  /**
   * Update user information
   *
   * Allows updating email, username, and profile information.
   * Validates that new email/username are not already in use.
   * Does NOT allow password updates via this method (security reason).
   *
   * @async
   * @param {string} id - User's UUID
   * @param {Object} updateUserData - Fields to update
   * @param {string} [updateUserData.email] - New email (optional, must be unique)
   * @param {string} [updateUserData.username] - New username (optional, must be unique)
   * @param {string} [updateUserData.first_name] - New first name (optional)
   * @param {string} [updateUserData.last_name] - New last name (optional)
   *
   * @returns {Promise<User>} The updated user (without password)
   *
   * @throws {NotFoundException} If user does not exist
   * @throws {ConflictException} If new email/username is already in use
   *
   * @example
   * const updatedUser = await userService.update('user-id', {
   *   first_name: 'Johnny',
   *   last_name: 'Smith'
   * });
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
    // Check if user exists
    const user = await this.userRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`User with ID '${id}' not found`);
    }

    // If email is being updated, check for duplicates
    if (updateUserData.email && updateUserData.email !== user.email) {
      const existingEmailUser = await this.userRepository.findOne({
        where: { email: updateUserData.email },
      });
      if (existingEmailUser) {
        throw new EmailAlreadyExistsException();
      }
    }

    // If username is being updated, check for duplicates
    if (updateUserData.username && updateUserData.username !== user.username) {
      const existingUsernameUser = await this.userRepository.findOne({
        where: { username: updateUserData.username },
      });
      if (existingUsernameUser) {
        throw new UsernameAlreadyExistsException();
      }
    }

    // Update only provided fields
    if (updateUserData.email) user.email = updateUserData.email;
    if (updateUserData.username) user.username = updateUserData.username;
    if (updateUserData.first_name !== undefined)
      user.first_name = updateUserData.first_name;
    if (updateUserData.last_name !== undefined)
      user.last_name = updateUserData.last_name;

    // Save changes to database
    const updatedUser = await this.userRepository.save(user);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return this.formatUserResponse(updatedUser);
  }

  /**
   * Delete a user by their ID
   *
   * Permanently removes a user and all associated data from the database.
   *
   * @async
   * @param {string} id - User's UUID
   *
   * @returns {Promise<void>} No return value
   *
   * @throws {NotFoundException} If user does not exist
   *
   * @example
   * await userService.delete('user-id');
   */
  async delete(id: string): Promise<void> {
    // Check if user exists before deleting
    const user = await this.userRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new UserNotFoundException();
    }

    // Remove user from database
    await this.userRepository.remove(user);
  }

  /**
   * Get total count of active users
   *
   * Useful for statistics and monitoring.
   *
   * @async
   * @returns {Promise<number>} Number of active users
   *
   * @example
   * const totalUsers = await userService.count();
   * console.log(`Total users: ${totalUsers}`);
   */
  async count(): Promise<number> {
    return this.userRepository.count({
      where: { is_active: true },
    });
  }

  /**
   * Format user response by removing password hash
   *
   * This method strips the password_hash field to prevent accidental
   * exposure of sensitive data in API responses.
   *
   * @private
   * @param {User} user - Raw user from database
   * @returns {any} User object without password hash
   *
   * @security This ensures passwords are never sent to the client
   */
  private formatUserResponse(user: User): any {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password_hash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}
