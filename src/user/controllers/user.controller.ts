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
  UseGuards,
  ForbiddenException,
  ConflictException,
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
  ApiForbiddenResponse,
  ApiBearerAuth,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { UserService } from '../services/user.service';
import { CreateUserDto } from '../dtos/create-user.dto';
import { UpdateUserDto } from '../dtos/update-user.dto';
import { UserResponseDto } from '../dtos/user.response.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { User } from '../entities/user.entity';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { UserRole } from 'src/common/enums/role.enum';
import { plainToInstance } from 'class-transformer';

/**
 * User Controller
 *
 * Handles HTTP requests related to user management.
 * Provides REST API endpoints for creating, reading, updating, and deleting users.
 * All request bodies are automatically validated using DTOs and class-validator.
 *
 * Base route: /users
 *
 * Protected routes (require JWT token):
 * - GET /users/:id
 * - PUT /users/:id
 * - DELETE /users/:id
 *
 * Public routes:
 * - POST /users (registration)
 *
 * @class UserController
 * @decorator @Controller('users')
 *
 * @example
 * // Access the controller at:
 * // GET /users/:id - Protected
 * // POST /users - Public (registration)
 * // PUT /users/:id - Protected
 * // DELETE /users/:id - Protected
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
   * Create a new user (Register)
   *
   * POST /users
   *
   * Public endpoint - No authentication required
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
      'Creates a new user with email, username, and password validation. No authentication required.',
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
   * Protected endpoint - Requires valid JWT token
   *
   * @param {User} currentUser - Currently authenticated user (from JWT)
   * @param {string} id - User's UUID (must be valid UUID v4)
   *
   * @returns {Promise<UserResponseDto>} User object (without password)
   *
   * @throws {BadRequestException} If ID is not a valid UUID
   * @throws {NotFoundException} If user does not exist
   * @throws {UnauthorizedException} If JWT token is invalid or missing
   *
   * @example
   * GET /users/550e8400-e29b-41d4-a716-446655440000
   * Authorization: Bearer <JWT_TOKEN>
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
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-Auth')
  @ApiUnauthorizedResponse({
    description: 'Unauthorized - Invalid or missing JWT token',
    example: {
      statusCode: 401,
      message: 'Unauthorized',
    },
  })
  @ApiOperation({
    summary: 'Get a user by ID',
    description: 'Retrieves a user by their UUID. Requires authentication.',
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
    @CurrentUser() currentUser: User,
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<UserResponseDto> {
    console.log(
      `User ${currentUser.email} (${currentUser.id}) is fetching user ${id}`,
    );
    return this.userService.findById(id);
  }

  /**
   * Update a user
   *
   * PUT /users/:id
   *
   * Protected endpoint - Requires valid JWT token
   * Users can only update their own profile
   *
   * @param {User} currentUser - Currently authenticated user (from JWT)
   * @param {string} id - User's UUID (must be valid UUID v4)
   * @param {UpdateUserDto} updateUserDto - User update data (validated, all optional)
   *
   * @returns {Promise<UserResponseDto>} Updated user object (without password)
   *
   * @throws {BadRequestException} If ID is not valid UUID or validation fails
   * @throws {NotFoundException} If user does not exist
   * @throws {ForbiddenException} If user tries to update another user's profile
   * @throws {ConflictException} If email/username already in use
   * @throws {UnauthorizedException} If JWT token is invalid or missing
   *
   * @example
   * PUT /users/550e8400-e29b-41d4-a716-446655440000
   * Authorization: Bearer <JWT_TOKEN>
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
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-Auth')
  @ApiUnauthorizedResponse({
    description: 'Unauthorized - Invalid or missing JWT token',
    example: {
      statusCode: 401,
      message: 'Unauthorized',
    },
  })
  @ApiOperation({
    summary: 'Update a user',
    description:
      'Updates one or more fields of an existing user. Users can only update their own profile. Requires authentication.',
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
  @ApiForbiddenResponse({
    description: 'User tries to update another user profile',
    example: {
      statusCode: 403,
      message: 'You can only update your own profile',
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
    @CurrentUser() currentUser: User,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body(new ValidationPipe({ transform: true, whitelist: true }))
    updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    // ✅ Ownership verification: User can only update their own profile
    if (currentUser.id !== id) {
      console.warn(
        `⚠️ User ${currentUser.email} attempted to update user ${id}`,
      );
      throw new ForbiddenException('You can only update your own profile');
    }

    console.log(
      `User ${currentUser.email} (${currentUser.id}) is updating their profile`,
    );
    return this.userService.update(id, updateUserDto);
  }

  /**
   * Delete a user
   *
   * DELETE /users/:id
   *
   * Protected endpoint - Requires valid JWT token
   * Users can only delete their own account
   *
   * @param {User} currentUser - Currently authenticated user (from JWT)
   * @param {string} id - User's UUID (must be valid UUID v4)
   *
   * @returns {Promise<{ message: string }>} Success message
   *
   * @throws {BadRequestException} If ID is not a valid UUID
   * @throws {NotFoundException} If user does not exist
   * @throws {ForbiddenException} If user tries to delete another user's account
   * @throws {UnauthorizedException} If JWT token is invalid or missing
   *
   * @example
   * DELETE /users/550e8400-e29b-41d4-a716-446655440000
   * Authorization: Bearer <JWT_TOKEN>
   *
   * Response (200 OK):
   * {
   *   "success": true,
   *   "statusCode": 200,
   *   "message": "Success",
   *   "data": { "message": "User deleted successfully" },
   *   "timestamp": "2025-11-02T20:32:10.873Z"
   * }
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-Auth')
  @ApiUnauthorizedResponse({
    description: 'Unauthorized - Invalid or missing JWT token',
    example: {
      statusCode: 401,
      message: 'Unauthorized',
    },
  })
  @ApiOperation({
    summary: 'Delete a user',
    description:
      'Permanently deletes a user and all associated data. Users can only delete their own account. Requires authentication.',
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
  @ApiForbiddenResponse({
    description: 'User tries to delete another user account',
    example: {
      statusCode: 403,
      message: 'You can only delete your own account',
    },
  })
  async delete(
    @CurrentUser() currentUser: User,
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<{ message: string }> {
    // ✅ Ownership verification: User can only delete their own account
    if (currentUser.id !== id) {
      console.warn(
        `⚠️ User ${currentUser.email} attempted to delete user ${id}`,
      );
      throw new ForbiddenException('You can only delete your own account');
    }

    console.log(
      `User ${currentUser.email} (${currentUser.id}) is deleting their account`,
    );
    await this.userService.delete(id);
    return {
      message: 'User deleted successfully',
    };
  }

  /**
   * Get all users (ADMIN ONLY)
   *
   * Retrieves a list of all users in the system.
   * Only accessible to users with ADMIN role.
   *
   * @returns {Promise<User[]>} Array of all users
   *
   * @throws {ForbiddenException} If user is not admin
   *
   * @example
   * GET /users/admin/list
   * Authorization: Bearer <ADMIN_TOKEN>
   * Response: [{ id: "...", email: "...", role: "admin" }, ...]
   */
  @Get('admin/list')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth('JWT-auth')
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Get all users (ADMIN ONLY)',
    description: 'Retrieve all users. Requires ADMIN role.',
  })
  @ApiResponse({
    status: 200,
    description: 'List of all users',
    type: [UserResponseDto],
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid or missing JWT token',
  })
  @ApiForbiddenResponse({
    description: 'User is not admin',
  })
  async getAllUsers(): Promise<UserResponseDto[]> {
    console.log(`ADMIN route accessed`);
    const users = await this.userService.findAll();

    return plainToInstance(UserResponseDto, users);
  }

  /**
   * Create Genesis Admin User (DEV ONLY)
   *
   * Creates the first admin user for development and testing.
   * This endpoint should only be called ONCE and then removed.
   *
   * ⚠️ WARNING: This is for development only!
   * Remove in production!
   *
   * @returns {Promise<UserResponseDto>} Created admin user
   *
   * @throws {ConflictException} If admin already exists
   *
   * @example
   * POST /users/dev/seed-admin
   * Response: { ..., role: "admin" }
   */
  @Post('dev/seed-admin')
  @ApiOperation({
    summary: 'Create Genesis Admin User (DEV ONLY)',
    description:
      'Creates the first admin user. Call this ONCE at startup. ⚠️ Remove in production!',
  })
  @ApiResponse({
    status: 201,
    description: 'Genesis admin created',
    type: UserResponseDto,
  })
  @ApiConflictResponse({
    description: 'Admin already exists',
  })
  async seedAdmin(): Promise<UserResponseDto> {
    console.log('🌱 Seeding Genesis Admin...');

    // Check if admin already exists
    const existingAdmin =
      await this.userService.findByEmail('admin@example.com');
    if (existingAdmin) {
      throw new ConflictException(
        'Genesis Admin already exists! Remove this endpoint.',
      );
    }

    // Create genesis admin
    const admin = await this.userService.createAdmin(
      'admin@example.com',
      'admin',
      'AdminPassword123!',
      'Admin',
      'User',
    );

    console.log(`✅ Genesis Admin created with ID: ${admin.id}`);

    return {
      id: admin.id,
      email: admin.email,
      username: admin.username,
      first_name: admin.first_name,
      last_name: admin.last_name,
      role: admin.role,
      is_active: admin.is_active,
      created_at: admin.created_at,
      updated_at: admin.updated_at,
    };
  }
}
