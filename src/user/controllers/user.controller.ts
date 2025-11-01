import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import { UserService } from '../services/user.service';

/**
 * User Controller
 *
 * Handles HTTP requests related to user management.
 * Provides REST API endpoints for creating, reading, updating, and deleting users.
 *
 * Base route: /users
 *
 * @class UserController
 * @decorator @Controller('users')
 *
 * @example
 * // Access the controller at:
 * // GET /users/:id
 * // POST /users
 * // PUT /users/:id
 * // DELETE /users/:id
 */
@Controller('users')
export class UserController {
  /**
   * Constructor - Injects the User service
   *
   * @param {UserService} userService - Service for user operations
   */
  constructor(private readonly userService: UserService) {}

  /**
   * Create a new user
   *
   * POST /users
   *
   * @param {Object} createUserDto - User creation data
   * @param {string} createUserDto.email - User's email
   * @param {string} createUserDto.username - User's username
   * @param {string} createUserDto.password - User's password (will be hashed)
   * @param {string} [createUserDto.first_name] - User's first name (optional)
   * @param {string} [createUserDto.last_name] - User's last name (optional)
   *
   * @returns {Promise<any>} Created user object (without password)
   *
   * @example
   * POST /users
   * Content-Type: application/json
   *
   * {
   *   "email": "john@example.com",
   *   "username": "john_doe",
   *   "password": "SecurePassword123!",
   *   "first_name": "John",
   *   "last_name": "Doe"
   * }
   *
   * Response (201 Created):
   * {
   *   "id": "550e8400-e29b-41d4-a716-446655440000",
   *   "email": "john@example.com",
   *   "username": "john_doe",
   *   "first_name": "John",
   *   "last_name": "Doe",
   *   "is_active": true,
   *   "created_at": "2025-11-01T23:31:00Z",
   *   "updated_at": "2025-11-01T23:31:00Z"
   * }
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body()
    createUserDto: {
      email: string;
      username: string;
      password: string;
      first_name?: string;
      last_name?: string;
    },
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return this.userService.create(createUserDto);
  }

  /**
   * Get a user by ID
   *
   * GET /users/:id
   *
   * @param {string} id - User's UUID (must be valid UUID v4)
   *
   * @returns {Promise<any>} User object (without password)
   *
   * @throws {BadRequestException} If ID is not a valid UUID
   * @throws {NotFoundException} If user does not exist
   *
   * @example
   * GET /users/550e8400-e29b-41d4-a716-446655440000
   *
   * Response (200 OK):
   * {
   *   "id": "550e8400-e29b-41d4-a716-446655440000",
   *   "email": "john@example.com",
   *   "username": "john_doe",
   *   "first_name": "John",
   *   "last_name": "Doe",
   *   "is_active": true,
   *   "created_at": "2025-11-01T23:31:00Z",
   *   "updated_at": "2025-11-01T23:31:00Z"
   * }
   */
  @Get(':id')
  async findById(@Param('id', new ParseUUIDPipe()) id: string) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return this.userService.findById(id);
  }

  /**
   * Update a user
   *
   * PUT /users/:id
   *
   * @param {string} id - User's UUID (must be valid UUID v4)
   * @param {Object} updateUserDto - User update data (all fields optional)
   * @param {string} [updateUserDto.email] - New email (optional)
   * @param {string} [updateUserDto.username] - New username (optional)
   * @param {string} [updateUserDto.first_name] - New first name (optional)
   * @param {string} [updateUserDto.last_name] - New last name (optional)
   *
   * @returns {Promise<any>} Updated user object (without password)
   *
   * @throws {BadRequestException} If ID is not a valid UUID
   * @throws {NotFoundException} If user does not exist
   * @throws {ConflictException} If email/username is already in use
   *
   * @example
   * PUT /users/550e8400-e29b-41d4-a716-446655440000
   * Content-Type: application/json
   *
   * {
   *   "first_name": "Johnny",
   *   "last_name": "Smith"
   * }
   *
   * Response (200 OK):
   * {
   *   "id": "550e8400-e29b-41d4-a716-446655440000",
   *   "email": "john@example.com",
   *   "username": "john_doe",
   *   "first_name": "Johnny",
   *   "last_name": "Smith",
   *   "is_active": true,
   *   "created_at": "2025-11-01T23:31:00Z",
   *   "updated_at": "2025-11-01T23:32:15Z"
   * }
   */
  @Put(':id')
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body()
    updateUserDto: {
      email?: string;
      username?: string;
      first_name?: string;
      last_name?: string;
    },
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return this.userService.update(id, updateUserDto);
  }

  /**
   * Delete a user
   *
   * DELETE /users/:id
   *
   * @param {string} id - User's UUID (must be valid UUID v4)
   *
   * @returns {Promise<void>} No content
   *
   * @throws {BadRequestException} If ID is not a valid UUID
   * @throws {NotFoundException} If user does not exist
   *
   * @example
   * DELETE /users/550e8400-e29b-41d4-a716-446655440000
   *
   * Response (204 No Content):
   * (empty body)
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id', new ParseUUIDPipe()) id: string): Promise<void> {
    return this.userService.delete(id);
  }
}
