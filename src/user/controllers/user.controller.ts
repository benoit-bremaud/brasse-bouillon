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
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiParam,
  ApiBody,
  ApiCreatedResponse,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiConflictResponse,
} from '@nestjs/swagger';
import { UserService } from '../services/user.service';
import { CreateUserDto } from '../dtos/create-user.dto';
import { UpdateUserDto } from '../dtos/update-user.dto';
import { UserResponseDto } from '../dtos/user.response.dto';

/**
 * User Controller
 *
 * Handles HTTP requests related to user management.
 * Provides REST API endpoints for creating, reading, updating, and deleting users.
 * All request bodies are automatically validated using DTOs and class-validator.
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
@ApiTags('Users')
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
   * @param {CreateUserDto} createUserDto - User creation data (validated)
   *
   * @returns {Promise<UserResponseDto>} Created user object (without password)
   *
   * @throws {BadRequestException} If validation fails
   * @throws {ConflictException} If email or username already exists
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
  @ApiOperation({
    summary: 'Create a new user',
    description:
      'Creates a new user with email, username, and password validation',
  })
  @ApiBody({
    type: CreateUserDto,
    description: 'User creation data',
  })
  @ApiCreatedResponse({
    description: 'User created successfully',
    type: UserResponseDto,
    example: {
      success: true,
      statusCode: 201,
      message: 'Resource created successfully',
      data: {
        id: '550e8400-e29b-41d4-a716-446655440000',
        email: 'john@example.com',
        username: 'john_doe',
        first_name: 'John',
        last_name: 'Doe',
        is_active: true,
        created_at: '2025-11-01T23:31:00Z',
        updated_at: '2025-11-01T23:31:00Z',
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Validation failed (invalid email, weak password, etc.)',
    example: {
      statusCode: 400,
      message:
        'Password must contain uppercase, lowercase, number, and special character',
    },
  })
  @ApiConflictResponse({
    description: 'Email or username already exists',
    example: {
      statusCode: 400,
      message: 'Email already exists. Please use a different email address.',
    },
  })
  async create(
    @Body(new ValidationPipe({ transform: true, whitelist: true }))
    createUserDto: CreateUserDto,
  ): Promise<UserResponseDto> {
    return this.userService.create(createUserDto);
  }

  /**
   * Get a user by ID
   *
   * GET /users/:id
   *
   * @param {string} id - User's UUID (must be valid UUID v4)
   *
   * @returns {Promise<UserResponseDto>} User object (without password)
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
  @ApiOperation({
    summary: 'Get a user by ID',
    description: 'Retrieves a user by their UUID',
  })
  @ApiParam({
    name: 'id',
    description: 'User UUID (v4 format)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'User found',
    type: UserResponseDto,
    example: {
      success: true,
      statusCode: 200,
      message: 'Success',
      data: {
        id: '550e8400-e29b-41d4-a716-446655440000',
        email: 'john@example.com',
        username: 'john_doe',
        first_name: 'John',
        last_name: 'Doe',
        is_active: true,
        created_at: '2025-11-01T23:31:00Z',
        updated_at: '2025-11-01T23:31:00Z',
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Invalid UUID format',
    example: {
      statusCode: 400,
      message: 'Validation failed (uuid v4 expected)',
    },
  })
  @ApiNotFoundResponse({
    description: 'User not found',
    example: {
      statusCode: 404,
      message: 'User not found',
    },
  })
  async findById(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<UserResponseDto> {
    return this.userService.findById(id);
  }

  /**
   * Update a user
   *
   * PUT /users/:id
   *
   * @param {string} id - User's UUID (must be valid UUID v4)
   * @param {UpdateUserDto} updateUserDto - User update data (validated, all optional)
   *
   * @returns {Promise<UserResponseDto>} Updated user object (without password)
   *
   * @throws {BadRequestException} If ID is not valid UUID or validation fails
   * @throws {NotFoundException} If user does not exist
   * @throws {ConflictException} If email/username already in use
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
  @ApiOperation({
    summary: 'Update a user',
    description: 'Updates one or more fields of an existing user',
  })
  @ApiParam({
    name: 'id',
    description: 'User UUID (v4 format)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiBody({
    type: UpdateUserDto,
    description: 'User update data (all fields optional)',
  })
  @ApiResponse({
    status: 200,
    description: 'User updated successfully',
    type: UserResponseDto,
    example: {
      success: true,
      statusCode: 200,
      message: 'Success',
      data: {
        id: '550e8400-e29b-41d4-a716-446655440000',
        email: 'john@example.com',
        username: 'john_doe',
        first_name: 'Johnny',
        last_name: 'Smith',
        is_active: true,
        created_at: '2025-11-01T23:31:00Z',
        updated_at: '2025-11-01T23:32:15Z',
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Validation failed or invalid UUID',
    example: {
      statusCode: 400,
      message: 'Email must be a valid email address',
    },
  })
  @ApiNotFoundResponse({
    description: 'User not found',
    example: {
      statusCode: 404,
      message: 'User not found',
    },
  })
  @ApiConflictResponse({
    description: 'Email or username already in use',
    example: {
      statusCode: 400,
      message: 'Username already exists. Please use a different username.',
    },
  })
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body(new ValidationPipe({ transform: true, whitelist: true }))
    updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    return this.userService.update(id, updateUserDto);
  }

  /**
   * Delete a user
   *
   * DELETE /users/:id
   *
   * @param {string} id - User's UUID (must be valid UUID v4)
   *
   * @returns {Promise<{ message: string }>} Success message
   *
   * @throws {BadRequestException} If ID is not a valid UUID
   * @throws {NotFoundException} If user does not exist
   *
   * @example
   * DELETE /users/550e8400-e29b-41d4-a716-446655440000
   *
   * Response (200 OK):
   * {
   *   "success": true,
   *   "statusCode": 200,
   *   "message": "User deleted successfully",
   *   "data": { "message": "User deleted successfully" },
   *   "timestamp": "2025-11-02T20:32:10.873Z"
   * }
   */
  @Delete(':id')
  @ApiOperation({
    summary: 'Delete a user',
    description: 'Permanently deletes a user and all associated data',
  })
  @ApiParam({
    name: 'id',
    description: 'User UUID (v4 format)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'User deleted successfully',
    example: {
      success: true,
      statusCode: 200,
      message: 'Success',
      data: { message: 'User deleted successfully' },
      timestamp: '2025-11-02T20:32:10.873Z',
    },
  })
  @ApiBadRequestResponse({
    description: 'Invalid UUID format',
    example: {
      statusCode: 400,
      message: 'Validation failed (uuid v4 expected)',
    },
  })
  @ApiNotFoundResponse({
    description: 'User not found',
    example: {
      statusCode: 404,
      message: 'User not found',
    },
  })
  async delete(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<{ message: string }> {
    await this.userService.delete(id);
    return {
      message: 'User deleted successfully',
    };
  }
}
