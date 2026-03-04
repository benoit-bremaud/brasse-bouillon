import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Get,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiBody,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiBearerAuth,
  ApiTooManyRequestsResponse,
} from '@nestjs/swagger';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { AuthService } from '../services/auth.service';
import { LoginDto } from '../dtos/login.dto';
import { AuthResponseDto } from '../dtos/auth-response.dto';
import { CreateUserDto } from '../../user/dtos/create-user.dto';
import { UserService } from '../../user/services/user.service';
import { PasswordService } from '../services/password.service';
import { JwtAuthGuard } from '../guards/jwt.guard';
import { CurrentUser } from '../decorators/current-user.decorator';
import { User } from '../../user/entities/user.entity';

/**
 * Auth Controller
 *
 * Handles authentication endpoints:
 * - POST /auth/login - User login
 * - POST /auth/register - User registration
 * - GET /auth/me - Get current user (protected)
 *
 * @class AuthController
 * @decorator @Controller('auth')
 */
@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  /**
   * Constructor - Injects dependencies
   *
   * @param {AuthService} authService - Authentication logic
   * @param {UserService} userService - User management
   * @param {PasswordService} passwordService - Password hashing
   */
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly passwordService: PasswordService,
  ) {}

  /**
   * User login endpoint
   *
   * POST /auth/login
   *
   * Authenticates user with email and password.
   * Returns JWT token for subsequent requests.
   *
   * @param {LoginDto} loginDto - { email, password }
   *
   * @returns {Promise<AuthResponseDto>} { access_token, user }
   *
   * @throws {UnauthorizedException} If credentials are invalid
   * @throws {NotFoundException} If user does not exist
   *
   * @example
   * POST /auth/login
   * Content-Type: application/json
   *
   * {
   *   "email": "john@example.com",
   *   "password": "SecurePassword123!"
   * }
   *
   * Response (200 OK):
   * {
   *   "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
   *   "user": {
   *     "id": "550e8400-e29b-41d4-a716-446655440000",
   *     "email": "john@example.com",
   *     "username": "john_doe",
   *     "first_name": "John",
   *     "last_name": "Doe",
   *     "is_active": true,
   *     "created_at": "2025-11-01T23:31:00Z",
   *     "updated_at": "2025-11-01T23:31:00Z"
   *   }
   * }
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UseGuards(ThrottlerGuard)
  @ApiOperation({
    summary: 'User login',
    description: 'Authenticates user and returns JWT token',
  })
  @ApiBody({
    type: LoginDto,
    description: 'Login credentials',
  })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    type: AuthResponseDto,
    example: {
      success: true,
      statusCode: 200,
      message: 'Success',
      data: {
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        user: {
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
    },
  })
  @ApiBadRequestResponse({
    description: 'Validation failed',
    example: {
      statusCode: 400,
      message: 'Email must be a valid email address',
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid credentials',
    example: {
      statusCode: 401,
      message: 'Invalid credentials',
    },
  })
  @ApiTooManyRequestsResponse({
    description: 'Too many login attempts, please retry later',
  })
  @Throttle({
    default: {
      limit: 5,
      ttl: 60_000,
    },
  })
  async login(
    @Body(new ValidationPipe({ transform: true, whitelist: true }))
    loginDto: LoginDto,
  ): Promise<AuthResponseDto> {
    return this.authService.login(loginDto);
  }

  /**
   * User registration endpoint
   *
   * POST /auth/register
   *
   * Creates a new user account with email, username, and password.
   * Returns JWT token and user data for immediate login.
   *
   * @param {CreateUserDto} createUserDto - User data
   *
   * @returns {Promise<AuthResponseDto>} { access_token, user }
   *
   * @throws {BadRequestException} If validation fails
   * @throws {ConflictException} If email/username already exists
   *
   * @example
   * POST /auth/register
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
   *   "success": true,
   *   "statusCode": 201,
   *   "message": "Resource created successfully",
   *   "data": {
   *     "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
   *     "user": {
   *       "id": "550e8400-e29b-41d4-a716-446655440000",
   *       "email": "john@example.com",
   *       "username": "john_doe",
   *       "first_name": "John",
   *       "last_name": "Doe",
   *       "is_active": true,
   *       "created_at": "2025-11-02T10:18:00Z",
   *       "updated_at": "2025-11-02T10:18:00Z"
   *     }
   *   }
   * }
   */
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'User registration',
    description: 'Creates new user account and returns JWT token',
  })
  @ApiBody({
    type: CreateUserDto,
    description: 'User registration data',
  })
  @ApiResponse({
    status: 201,
    description: 'User created successfully',
    type: AuthResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Validation failed',
  })
  async register(
    @Body(new ValidationPipe({ transform: true, whitelist: true }))
    createUserDto: CreateUserDto,
  ): Promise<AuthResponseDto> {
    // Create user via UserService (validates email/username uniqueness)
    await this.userService.create(createUserDto);

    // Login immediately (generate token)
    const response = await this.authService.login({
      email: createUserDto.email,
      password: createUserDto.password,
    });

    return response;
  }

  /**
   * Get current authenticated user
   *
   * GET /auth/me
   *
   * Returns the current user data from JWT token.
   * Requires valid JWT token in Authorization header.
   *
   * @param {User} user - Current user (from @CurrentUser decorator)
   *
   * @returns {Promise<any>} Current user object
   *
   * @example
   * GET /auth/me
   * Authorization: Bearer <jwt_token>
   *
   * Response (200 OK):
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
   *     "is_active": true,
   *     "created_at": "2025-11-01T23:31:00Z",
   *     "updated_at": "2025-11-01T23:31:00Z"
   *   }
   * }
   */
  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get current user',
    description: 'Returns authenticated user data from JWT token',
  })
  @ApiResponse({
    status: 200,
    description: 'Current user data',
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
  @ApiUnauthorizedResponse({
    description: 'Missing or invalid JWT token',
  })
  getCurrentUser(@CurrentUser() user: User): any {
    return user;
  }
}
