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
  Patch,
  Headers,
  NotFoundException,
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
  ApiExcludeEndpoint,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';

import { UserService } from '../services/user.service';
import { CreateUserDto } from '../dtos/create-user.dto';
import { UpdateUserDto } from '../dtos/update-user.dto';
import { UserResponseDto } from '../dtos/user.response.dto';
import { ChangePasswordDto } from '../../auth/dtos/change-password.dto';
import { ChangePasswordResponseDto } from '../../auth/dtos/change-password-response.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { Roles } from '../../auth/decorators/roles.decorator';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { User } from '../entities/user.entity';
import { UserRole } from '../../common/enums/role.enum';
import { ConfigService } from '@nestjs/config';

/**
 * User Controller
 *
 * Handles HTTP requests related to user management and authentication.
 * Provides comprehensive REST API endpoints for user operations including:
 * - User registration and creation
 * - Profile retrieval and updates
 * - Password management
 * - Administrative user listing
 * - Development seed data endpoints
 *
 * All request bodies are automatically validated using DTOs and class-validator.
 * Protected routes require a valid JWT token via Authorization header.
 *
 * Route prefix: `/users`
 *
 * @class UserController
 * @decorator @Controller('users')
 * @decorator @ApiTags('Users')
 *
 * Security:
 * - Public routes: POST /users (registration)
 * - Protected routes: All other routes require JWT authentication
 * - Admin routes: GET /users/admin/list requires ADMIN role
 * - Ownership enforcement: Users can only modify/delete their own profile
 *
 * @example
 * // Register a new user
 * POST /users
 *
 * // Get authenticated user's profile
 * GET /users/me (requires JWT)
 *
 * // Update current user's profile
 * PATCH /users/me (requires JWT)
 *
 * // Change password
 * POST /users/me/change-password (requires JWT)
 *
 * // Get list of all users (admin only)
 * GET /users/admin/list (requires JWT + ADMIN role)
 */
@ApiTags('Users')
@Controller('users')
export class UserController {
  /**
   * Constructor - Dependency injection
   *
   * @param {UserService} userService - Service for user operations (CRUD, auth, etc.)
   */
  constructor(
    private readonly userService: UserService,
    private readonly configService: ConfigService,
  ) {}

  // ============================================================================
  // 📝 PUBLIC ROUTES - No Authentication Required
  // ============================================================================

  /**
   * Create a new user (Register)
   *
   * POST /users
   *
   * Public endpoint for user self-registration. Creates a new user account with
   * email, username, password, and optional personal information.
   *
   * Validation:
   * - Email: Must be valid format and unique in database
   * - Username: 3-20 characters, alphanumeric + underscore, must be unique
   * - Password: Min 8 chars, uppercase + lowercase + number + special char
   * - Names: Optional, max 100 characters each
   *
   * Security:
   * - Password is hashed with bcrypt before storage
   * - No plain-text password returned in response
   * - Default role: USER
   * - Account starts as active (is_active: true)
   *
   * @param {CreateUserDto} createUserDto - User creation data (validated)
   *
   * @returns {Promise<UserResponseDto>} Created user profile (password excluded)
   *
   * @throws {BadRequestException} If validation fails (invalid format, weak password)
   * @throws {ConflictException} If email or username already exists in database
   *
   * @example
   * // Request
   * POST /users HTTP/1.1
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
   * // Response (201 Created)
   * {
   *   "success": true,
   *   "statusCode": 201,
   *   "message": "Resource created successfully",
   *   "data": {
   *     "id": "550e8400-e29b-41d4-a716-446655440000",
   *     "email": "john@example.com",
   *     "username": "john_doe",
   *     "first_name": "John",
   *     "last_name": "Doe",
   *     "role": "user",
   *     "is_active": true,
   *     "created_at": "2025-11-03T16:50:00.000Z",
   *     "updated_at": "2025-11-03T16:50:00.000Z"
   *   },
   *   "timestamp": "2025-11-03T16:50:00.000Z"
   * }
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new user (Register)',
    description:
      'Public registration endpoint. Creates a new user account with email, username, and password validation.',
  })
  @ApiBody({
    type: CreateUserDto,
    description: 'User registration data with validation requirements',
  })
  @ApiCreatedResponse({
    description: 'User created successfully',
    type: UserResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Validation failed (invalid email, weak password, etc.)',
  })
  @ApiConflictResponse({
    description: 'Email or username already registered',
  })
  async create(
    @Body(new ValidationPipe({ transform: true, whitelist: true }))
    createUserDto: CreateUserDto,
  ): Promise<UserResponseDto> {
    return this.userService.create(createUserDto);
  }

  // ============================================================================
  // 👤 PROTECTED ROUTES - Current User Profile
  // ============================================================================

  /**
   * Get current user profile (fully authenticated endpoint)
   *
   * GET /users/me
   *
   * Retrieves the complete profile information of the authenticated user.
   * Requires valid JWT token in Authorization header.
   *
   * Security:
   * - Requires valid JWT token
   * - Returns only the authenticated user's data
   * - Excludes sensitive fields (password_hash)
   * - Includes full audit metadata (created_at, updated_at)
   *
   * Use cases:
   * - Hydrate frontend user profile on app load
   * - Verify user identity and permissions
   * - Display user dashboard information
   *
   * @param {User} user - Current authenticated user (extracted from JWT token via @CurrentUser decorator)
   *
   * @returns {Promise<UserResponseDto>} Complete user profile data (password excluded)
   *
   * @throws {UnauthorizedException} If JWT token is missing or invalid
   *
   * @example
   * // Request
   * GET /users/me HTTP/1.1
   * Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   *
   * // Response (200 OK)
   * {
   *   "success": true,
   *   "statusCode": 200,
   *   "message": "Success",
   *   "data": {
   *     "id": "550e8400-e29b-41d4-a716-446655440000",
   *     "email": "john@example.com",
   *     "username": "john_doe",
   *     "first_name": "John",
   *     "last_name": "Doe",
   *     "role": "user",
   *     "is_active": true,
   *     "created_at": "2025-11-02T23:20:19.000Z",
   *     "updated_at": "2025-11-02T23:20:19.000Z"
   *   },
   *   "timestamp": "2025-11-03T16:50:00.000Z"
   * }
   */
  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get current user profile',
    description:
      'Returns complete profile of authenticated user. Requires valid JWT token.',
  })
  @ApiResponse({
    status: 200,
    description: 'User profile retrieved successfully',
  })
  @ApiUnauthorizedResponse({
    description: 'Missing or invalid JWT token',
  })
  async getMe(@CurrentUser() user: User): Promise<UserResponseDto> {
    const completeUser = await this.userService.findById(user.id);
    return plainToInstance(UserResponseDto, completeUser);
  }

  /**
   * Update current user profile (partial update)
   *
   * PATCH /users/me
   *
   * Allows authenticated user to update their own profile information.
   * Supports partial updates - only provided fields are updated.
   *
   * Updateable fields:
   * - email: Must be unique and valid email format
   * - username: 3-20 chars, alphanumeric + underscore, must be unique
   * - first_name: Optional, max 100 characters
   * - last_name: Optional, max 100 characters
   *
   * Non-updateable fields:
   * - password: Use POST /users/me/change-password instead
   * - role: Requires ADMIN permission (use admin endpoints)
   * - id, created_at: Immutable
   *
   * Validation:
   * - All fields are optional (partial update)
   * - Email/username uniqueness checked against other users
   * - Automatic timestamp update (updated_at)
   *
   * @param {User} user - Current authenticated user (from JWT)
   * @param {UpdateUserDto} updateUserDto - Fields to update (all optional, validated)
   *
   * @returns {Promise<UserResponseDto>} Updated user profile (password excluded)
   *
   * @throws {BadRequestException} If validation fails (invalid email format, weak password)
   * @throws {ConflictException} If email/username already in use by another user
   * @throws {UnauthorizedException} If JWT token is missing or invalid
   *
   * @example
   * // Request - Update only first_name
   * PATCH /users/me HTTP/1.1
   * Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   * Content-Type: application/json
   *
   * {
   *   "first_name": "Johnny"
   * }
   *
   * // Response (200 OK) - Only first_name changed, others unchanged
   * {
   *   "success": true,
   *   "statusCode": 200,
   *   "message": "Success",
   *   "data": {
   *     "id": "550e8400-e29b-41d4-a716-446655440000",
   *     "email": "john@example.com",
   *     "username": "john_doe",
   *     "first_name": "Johnny",
   *     "last_name": "Doe",
   *     "role": "user",
   *     "is_active": true,
   *     "created_at": "2025-11-02T23:20:19.000Z",
   *     "updated_at": "2025-11-03T16:55:00.000Z"
   *   }
   * }
   */
  @Patch('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update current user profile',
    description:
      'Partially update authenticated user profile. Only provided fields are updated.',
  })
  @ApiBody({
    type: UpdateUserDto,
    description: 'User profile fields to update (all optional)',
  })
  @ApiResponse({
    status: 200,
    description: 'User profile updated successfully',
  })
  @ApiBadRequestResponse({
    description: 'Validation failed or email/username already exists',
  })
  @ApiUnauthorizedResponse({
    description: 'Missing or invalid JWT token',
  })
  async updateMe(
    @CurrentUser() user: User,
    @Body(new ValidationPipe({ transform: true, whitelist: true }))
    updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    const updatedUser = await this.userService.update(user.id, updateUserDto);
    return plainToInstance(UserResponseDto, updatedUser);
  }

  /**
   * Change password (secure password update)
   *
   * POST /users/me/change-password
   *
   * Secure endpoint for authenticated users to change their password.
   * Requires verification of old password before accepting new one.
   *
   * Security requirements:
   * - Must provide current password for verification
   * - New password must meet strength requirements (8 chars min, mixed case, number, special char)
   * - Invalid old password returns 401 Unauthorized
   * - Passwords are hashed with bcrypt before storage
   * - No plain-text passwords in any response
   *
   * Password strength validation:
   * - Minimum 8 characters
   * - At least 1 uppercase letter (A-Z)
   * - At least 1 lowercase letter (a-z)
   * - At least 1 digit (0-9)
   * - At least 1 special character (!@#$%^&*)
   *
   * Audit:
   * - User's updated_at timestamp is updated
   * - Change is logged (console: user email + ID)
   *
   * @param {User} user - Current authenticated user (from JWT)
   * @param {ChangePasswordDto} changePasswordDto - Old password (for verification) + new password
   *
   * @returns {Promise<ChangePasswordResponseDto>} Success message
   *
   * @throws {UnauthorizedException} If old password is incorrect
   * @throws {BadRequestException} If new password validation fails (weak password)
   * @throws {NotFoundException} If user not found in database
   *
   * @example
   * // Request
   * POST /users/me/change-password HTTP/1.1
   * Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   * Content-Type: application/json
   *
   * {
   *   "old_password": "OldPassword123!",
   *   "new_password": "NewPassword456!"
   * }
   *
   * // Response (200 OK)
   * {
   *   "success": true,
   *   "statusCode": 200,
   *   "message": "Success",
   *   "data": {
   *     "message": "Password changed successfully"
   *   }
   * }
   *
   * // Error Response (401 Unauthorized)
   * {
   *   "statusCode": 401,
   *   "message": "Old password is incorrect"
   * }
   */
  @Post('me/change-password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Change user password',
    description:
      'Secure password change endpoint. Requires verification with current password.',
  })
  @ApiBody({
    type: ChangePasswordDto,
    description: 'Current password (for verification) and new password',
  })
  @ApiResponse({
    status: 200,
    description: 'Password changed successfully',
    type: ChangePasswordResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid JWT token or old password is incorrect',
  })
  @ApiBadRequestResponse({
    description: 'New password validation failed (weak password)',
  })
  async changePassword(
    @CurrentUser() user: User,
    @Body(new ValidationPipe({ transform: true, whitelist: true }))
    changePasswordDto: ChangePasswordDto,
  ): Promise<ChangePasswordResponseDto> {
    await this.userService.changePassword(
      user.id,
      changePasswordDto.old_password,
      changePasswordDto.new_password,
    );

    return {
      message: 'Password changed successfully',
    };
  }

  // ============================================================================
  // 🔐 ADMIN ROUTES - Administrative Operations
  // ============================================================================

  /**
   * Get all users (ADMIN ONLY)
   *
   * GET /users/admin/list
   *
   * Retrieves a complete list of all users in the system.
   * Restricted to users with ADMIN role only.
   *
   * Security:
   * - Requires valid JWT token
   * - Requires ADMIN role in token payload
   * - Failure to meet requirements returns 403 Forbidden
   * - All user data is returned (including metadata)
   * - Passwords are excluded via UserResponseDto
   *
   * Use cases:
   * - Admin dashboard user management
   * - User statistics and monitoring
   * - Administrative reporting
   * - Bulk user operations
   *
   * @returns {Promise<UserResponseDto[]>} Array of all users (password excluded)
   *
   * @throws {UnauthorizedException} If JWT token is missing or invalid
   * @throws {ForbiddenException} If user does not have ADMIN role
   *
   * @example
   * // Request
   * GET /users/admin/list HTTP/1.1
   * Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   *
   * // Response (200 OK)
   * {
   *   "success": true,
   *   "statusCode": 200,
   *   "message": "Success",
   *   "data": [
   *     {
   *       "id": "admin-uuid",
   *       "email": "admin@example.com",
   *       "username": "admin",
   *       "role": "admin",
   *       "is_active": true,
   *       "created_at": "2025-11-02T23:20:19.000Z",
   *       "updated_at": "2025-11-02T23:20:19.000Z"
   *     },
   *     {
   *       "id": "user-uuid",
   *       "email": "user@example.com",
   *       "username": "user_123",
   *       "role": "user",
   *       "is_active": true,
   *       "created_at": "2025-11-03T10:00:00.000Z",
   *       "updated_at": "2025-11-03T16:50:00.000Z"
   *     }
   *   ]
   * }
   */
  @Get('admin/list')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get all users (ADMIN ONLY)',
    description: 'Retrieve complete list of all users. Requires ADMIN role.',
  })
  @ApiResponse({
    status: 200,
    description: 'List of all users retrieved successfully',
  })
  @ApiUnauthorizedResponse({
    description: 'Missing or invalid JWT token',
  })
  @ApiForbiddenResponse({
    description: 'User does not have ADMIN role',
  })
  async getAllUsers(): Promise<UserResponseDto[]> {
    console.log(`📋 ADMIN route: Fetching all users`);
    const users = await this.userService.findAll();
    return plainToInstance(UserResponseDto, users);
  }

  // ============================================================================
  // 🔧 PARAMETRIC ROUTES - User-by-ID Operations (Last in order!)
  // ============================================================================

  /**
   * Get a user by ID
   *
   * GET /users/:id
   *
   * Retrieves a specific user's profile by their UUID.
   * Requires authentication but accessible by any authenticated user.
   *
   * Security:
   * - Requires valid JWT token
   * - Ownership: users can only view their own profile (ADMIN can view any user)
   * - Excludes password from response via UserResponseDto
   *
   * Use cases:
   * - Look up other users' profiles (for friends, follows, etc.)
   * - Frontend user profile pages
   * - API calls for user information
   *
   * @param {User} currentUser - Currently authenticated user (from JWT, for logging)
   * @param {string} id - Target user's UUID (must be valid UUID v4 format)
   *
   * @returns {Promise<UserResponseDto>} Requested user's profile (password excluded)
   *
   * @throws {BadRequestException} If UUID format is invalid
   * @throws {NotFoundException} If user with given ID does not exist
   * @throws {UnauthorizedException} If JWT token is missing or invalid
   *
   * @example
   * // Request
   * GET /users/550e8400-e29b-41d4-a716-446655440000 HTTP/1.1
   * Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   *
   * // Response (200 OK)
   * {
   *   "success": true,
   *   "statusCode": 200,
   *   "message": "Success",
   *   "data": {
   *     "id": "550e8400-e29b-41d4-a716-446655440000",
   *     "email": "john@example.com",
   *     "username": "john_doe",
   *     "first_name": "John",
   *     "last_name": "Doe",
   *     "role": "user",
   *     "is_active": true,
   *     "created_at": "2025-11-01T23:31:00.000Z",
   *     "updated_at": "2025-11-01T23:31:00.000Z"
   *   }
   * }
   *
   * // Error Response (404 Not Found)
   * {
   *   "statusCode": 404,
   *   "message": "User not found"
   * }
   */
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get a user by ID',
    description:
      'Retrieve a specific user profile by UUID. Requires authentication.',
  })
  @ApiParam({
    name: 'id',
    description: 'Target user UUID (v4 format)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'User found and returned',
  })
  @ApiBadRequestResponse({
    description: 'Invalid UUID format',
  })
  @ApiNotFoundResponse({
    description: 'User not found in database',
  })
  @ApiUnauthorizedResponse({
    description: 'Missing or invalid JWT token',
  })
  @ApiForbiddenResponse({
    description: 'User tries to access another user profile',
  })
  async findById(
    @CurrentUser() currentUser: User,
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<UserResponseDto> {
    if (currentUser.id !== id && currentUser.role !== UserRole.ADMIN) {
      console.warn(
        `⚠️ SECURITY: User ${currentUser.email} (${currentUser.id}) attempted to access user ${id}`,
      );
      throw new ForbiddenException('You can only access your own profile');
    }

    console.log(
      `👤 User ${currentUser.email} (${currentUser.id}) fetching user ${id}`,
    );
    return this.userService.findById(id);
  }

  /**
   * Update a user by ID
   *
   * PUT /users/:id
   *
   * Updates a user's profile information. Users can only update their own profile.
   * Supports partial updates - only provided fields are updated.
   *
   * Ownership enforcement:
   * - Authenticated user can ONLY update their own profile
   * - Attempt to update another user's profile returns 403 Forbidden
   * - Violation is logged with user and target IDs for security audit
   *
   * Updateable fields (same as PATCH /users/me):
   * - email: Must be unique, valid format
   * - username: 3-20 chars, alphanumeric + underscore, must be unique
   * - first_name, last_name: Optional, max 100 chars each
   *
   * Non-updateable:
   * - password: Use POST /users/me/change-password
   * - role: Requires admin operations
   * - id, created_at: Immutable
   *
   * @param {User} currentUser - Currently authenticated user (enforced as owner)
   * @param {string} id - Target user ID (must match currentUser.id or error)
   * @param {UpdateUserDto} updateUserDto - Fields to update (all optional, validated)
   *
   * @returns {Promise<UserResponseDto>} Updated user profile (password excluded)
   *
   * @throws {BadRequestException} If ID is not valid UUID or validation fails
   * @throws {NotFoundException} If user does not exist
   * @throws {ForbiddenException} If user tries to update another user's profile
   * @throws {ConflictException} If email/username already in use
   * @throws {UnauthorizedException} If JWT token is missing or invalid
   *
   * @example
   * // Request - User updating their own profile
   * PUT /users/550e8400-e29b-41d4-a716-446655440000 HTTP/1.1
   * Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   * Content-Type: application/json
   *
   * {
   *   "first_name": "Johnny",
   *   "email": "john_new@example.com"
   * }
   *
   * // Response (200 OK)
   * {
   *   "success": true,
   *   "statusCode": 200,
   *   "message": "Success",
   *   "data": {
   *     "id": "550e8400-e29b-41d4-a716-446655440000",
   *     "email": "john_new@example.com",
   *     "username": "john_doe",
   *     "first_name": "Johnny",
   *     "last_name": "Doe",
   *     "role": "user",
   *     "is_active": true,
   *     "created_at": "2025-11-01T23:31:00.000Z",
   *     "updated_at": "2025-11-03T17:00:00.000Z"
   *   }
   * }
   *
   * // Error Response (403 Forbidden) - Trying to update another user
   * {
   *   "statusCode": 403,
   *   "message": "You can only update your own profile"
   * }
   */
  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update a user profile',
    description:
      'Update user information. Users can only update their own profile.',
  })
  @ApiParam({
    name: 'id',
    description:
      'Target user UUID (must match authenticated user for non-admins)',
  })
  @ApiBody({
    type: UpdateUserDto,
    description: 'User update data (all fields optional)',
  })
  @ApiResponse({
    status: 200,
    description: 'User updated successfully',
  })
  @ApiBadRequestResponse({
    description: 'Invalid UUID format or validation failed',
  })
  @ApiNotFoundResponse({
    description: 'User not found',
  })
  @ApiForbiddenResponse({
    description: 'User tries to update another user profile',
  })
  @ApiConflictResponse({
    description: 'Email or username already in use',
  })
  @ApiUnauthorizedResponse({
    description: 'Missing or invalid JWT token',
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
        `⚠️ SECURITY: User ${currentUser.email} (${currentUser.id}) attempted to update user ${id}`,
      );
      throw new ForbiddenException('You can only update your own profile');
    }

    console.log(
      `✏️ User ${currentUser.email} (${currentUser.id}) updating their profile`,
    );
    return this.userService.update(id, updateUserDto);
  }

  /**
   * Delete a user account
   *
   * DELETE /users/:id
   *
   * Permanently deletes a user account and all associated data.
   * Users can only delete their own account.
   *
   * Ownership enforcement:
   * - Authenticated user can ONLY delete their own account
   * - Attempt to delete another user returns 403 Forbidden
   * - Violation is logged with user and target IDs for security audit
   *
   * Data deletion:
   * - User record completely removed from database
   * - All associated data deleted (per cascade rules)
   * - This action is PERMANENT and IRREVERSIBLE
   *
   * Warning:
   * - No recovery possible after deletion
   * - Consider soft-delete approach for production systems
   *
   * @param {User} currentUser - Currently authenticated user (enforced as owner)
   * @param {string} id - Target user ID (must match currentUser.id or error)
   *
   * @returns {Promise<{ message: string }>} Confirmation message
   *
   * @throws {BadRequestException} If ID is not valid UUID
   * @throws {NotFoundException} If user does not exist
   * @throws {ForbiddenException} If user tries to delete another user's account
   * @throws {UnauthorizedException} If JWT token is missing or invalid
   *
   * @example
   * // Request
   * DELETE /users/550e8400-e29b-41d4-a716-446655440000 HTTP/1.1
   * Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   *
   * // Response (200 OK)
   * {
   *   "success": true,
   *   "statusCode": 200,
   *   "message": "Success",
   *   "data": {
   *     "message": "User deleted successfully"
   *   }
   * }
   *
   * // Error Response (403 Forbidden) - Trying to delete another user
   * {
   *   "statusCode": 403,
   *   "message": "You can only delete your own account"
   * }
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Delete a user account',
    description:
      'Permanently delete user account. Users can only delete their own account.',
  })
  @ApiParam({
    name: 'id',
    description: 'Target user UUID (must match authenticated user)',
  })
  @ApiResponse({
    status: 200,
    description: 'User deleted successfully',
  })
  @ApiBadRequestResponse({
    description: 'Invalid UUID format',
  })
  @ApiNotFoundResponse({
    description: 'User not found',
  })
  @ApiForbiddenResponse({
    description: 'User tries to delete another user account',
  })
  @ApiUnauthorizedResponse({
    description: 'Missing or invalid JWT token',
  })
  async delete(
    @CurrentUser() currentUser: User,
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<{ message: string }> {
    // ✅ Ownership verification: User can only delete their own account
    if (currentUser.id !== id) {
      console.warn(
        `⚠️ SECURITY: User ${currentUser.email} (${currentUser.id}) attempted to delete user ${id}`,
      );
      throw new ForbiddenException('You can only delete your own account');
    }

    console.log(
      `🗑️ User ${currentUser.email} (${currentUser.id}) deleting their account`,
    );
    await this.userService.delete(id);

    return {
      message: 'User deleted successfully',
    };
  }

  // ============================================================================
  // 🌱 DEV ROUTES - Development/Seed Data (Remove in Production!)
  // ============================================================================

  /**
   * Create Genesis Admin User (DEV ONLY)
   *
   * POST /users/dev/seed-admin
   *
   * ⚠️ DEVELOPMENT ONLY - REMOVE IN PRODUCTION! ⚠️
   *
   * Creates the first admin user for development and testing.
   * This endpoint should be called EXACTLY ONCE at development startup.
   * After calling, DELETE this endpoint from code before production deployment.
   *
   * Predefined credentials:
   * - Email: admin@example.com
   * - Username: admin
   * - Password: AdminPassword123!
   * - Name: Admin User
   * - Role: ADMIN (set by createAdmin method)
   *
   * Security notes:
   * - Credentials are hardcoded for dev convenience only
   * - MUST be removed before production
   * - Use proper admin provisioning for production
   * - Consider environment variables if keeping in non-prod
   * - Requires SEED_ENDPOINTS_ENABLED=true
   * - If SEED_ENDPOINTS_TOKEN is set, pass it via x-seed-token header
   *
   * @returns {Promise<UserResponseDto>} Created admin user
   *
   * @throws {ConflictException} If admin user already exists (idempotent safety)
   *
   * @example
   * // Request
   * POST /users/dev/seed-admin HTTP/1.1
   * Content-Type: application/json
   *
   * // Response (201 Created)
   * {
   *   "success": true,
   *   "statusCode": 201,
   *   "message": "Resource created successfully",
   *   "data": {
   *     "id": "admin-uuid",
   *     "email": "admin@example.com",
   *     "username": "admin",
   *     "first_name": "Admin",
   *     "last_name": "User",
   *     "role": "admin",
   *     "is_active": true,
   *     "created_at": "2025-11-03T17:00:00.000Z",
   *     "updated_at": "2025-11-03T17:00:00.000Z"
   *   }
   * }
   */
  @ApiExcludeEndpoint()
  @Post('dev/seed-admin')
  @ApiOperation({
    summary: 'Create Genesis Admin User (DEV ONLY)',
    description:
      '⚠️ DEVELOPMENT ONLY - Creates first admin user. Call ONCE then remove endpoint. NOT FOR PRODUCTION.',
  })
  @ApiCreatedResponse({
    description: 'Genesis admin created successfully',
  })
  @ApiConflictResponse({
    description: 'Admin already exists',
  })
  async seedAdmin(
    @Headers('x-seed-token') seedToken?: string,
  ): Promise<UserResponseDto> {
    this.ensureSeedAccess(seedToken);
    console.log('🌱 Seeding Genesis Admin...');

    // Check if admin already exists (idempotent)
    const existingAdmin =
      await this.userService.findByEmail('admin@example.com');
    if (existingAdmin) {
      throw new ConflictException(
        'Genesis Admin already exists! Remove this endpoint from code.',
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

    console.log(`✅ Genesis Admin created: ${admin.email} (ID: ${admin.id})`);

    return plainToInstance(UserResponseDto, admin);
  }

  /**
   * Create Moderator User (DEV ONLY)
   *
   * POST /users/dev/seed-moderator
   *
   * ⚠️ DEVELOPMENT ONLY - REMOVE IN PRODUCTION! ⚠️
   *
   * Creates a moderator user for development and testing.
   * This endpoint should be called EXACTLY ONCE after seeding the admin.
   * After calling, DELETE this endpoint from code before production deployment.
   *
   * Predefined credentials:
   * - Email: moderator@example.com
   * - Username: moderator
   * - Password: ModeratorPassword123!
   * - Name: Moderator User
   * - Role: MODERATOR (explicitly set after creation)
   *
   * Implementation flow:
   * 1. Check if moderator already exists (idempotent safety)
   * 2. Create user with elevated privileges (createAdmin method)
   * 3. Update role from ADMIN to MODERATOR
   * 4. Return result
   *
   * Security notes:
   * - Credentials are hardcoded for dev convenience only
   * - MUST be removed before production
   * - Use proper role provisioning for production
   * - Requires SEED_ENDPOINTS_ENABLED=true
   * - If SEED_ENDPOINTS_TOKEN is set, pass it via x-seed-token header
   *
   * @returns {Promise<UserResponseDto>} Created moderator user
   *
   * @throws {ConflictException} If moderator user already exists (idempotent safety)
   *
   * @example
   * // Request
   * POST /users/dev/seed-moderator HTTP/1.1
   * Content-Type: application/json
   *
   * // Response (201 Created)
   * {
   *   "success": true,
   *   "statusCode": 201,
   *   "message": "Resource created successfully",
   *   "data": {
   *     "id": "moderator-uuid",
   *     "email": "moderator@example.com",
   *     "username": "moderator",
   *     "first_name": "Moderator",
   *     "last_name": "User",
   *     "role": "moderator",
   *     "is_active": true,
   *     "created_at": "2025-11-03T17:05:00.000Z",
   *     "updated_at": "2025-11-03T17:05:00.000Z"
   *   }
   * }
   */
  @ApiExcludeEndpoint()
  @Post('dev/seed-moderator')
  @ApiOperation({
    summary: 'Create Moderator User (DEV ONLY)',
    description:
      '⚠️ DEVELOPMENT ONLY - Creates moderator user. Call ONCE then remove endpoint. NOT FOR PRODUCTION.',
  })
  @ApiCreatedResponse({
    description: 'Moderator created successfully',
  })
  @ApiConflictResponse({
    description: 'Moderator already exists',
  })
  async seedModerator(
    @Headers('x-seed-token') seedToken?: string,
  ): Promise<UserResponseDto> {
    this.ensureSeedAccess(seedToken);
    console.log('🌱 Seeding Moderator User...');

    // Check if moderator already exists (idempotent)
    const existingModerator = await this.userService.findByEmail(
      'moderator@example.com',
    );
    if (existingModerator) {
      throw new ConflictException(
        'Moderator already exists! Remove this endpoint from code.',
      );
    }

    // Create moderator user (initially with admin privileges then downgrade)
    const moderator = await this.userService.createAdmin(
      'moderator@example.com',
      'moderator',
      'ModeratorPassword123!',
      'Moderator',
      'User',
    );

    // Update role from ADMIN to MODERATOR
    const updatedModerator = await this.userService.updateUserRole(
      moderator.id,
      UserRole.MODERATOR,
    );

    console.log(
      `✅ Moderator created: ${updatedModerator.email} (ID: ${updatedModerator.id})`,
    );

    return plainToInstance(UserResponseDto, updatedModerator);
  }

  private ensureSeedAccess(seedToken?: string): void {
    const isProduction =
      this.configService.get<string>('NODE_ENV') === 'production';
    if (isProduction) {
      throw new NotFoundException();
    }

    const enabled =
      this.configService.get<string>('SEED_ENDPOINTS_ENABLED') === 'true';
    if (!enabled) {
      throw new NotFoundException();
    }

    const requiredToken = this.configService.get<string>(
      'SEED_ENDPOINTS_TOKEN',
    );
    if (requiredToken && seedToken !== requiredToken) {
      throw new NotFoundException();
    }
  }
}
