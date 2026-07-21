import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Get,
  Patch,
  Delete,
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
import { plainToInstance } from 'class-transformer';

import { AuthService } from '../services/auth.service';
import { LoginDto } from '../dtos/login.dto';
import { AuthResponseDto } from '../dtos/auth-response.dto';
import { ChangePasswordDto } from '../dtos/change-password.dto';
import { ChangePasswordResponseDto } from '../dtos/change-password-response.dto';
import { ForgotPasswordDto } from '../dtos/forgot-password.dto';
import { ForgotPasswordResponseDto } from '../dtos/forgot-password-response.dto';
import { ResetPasswordDto } from '../dtos/reset-password.dto';
import { ResetPasswordResponseDto } from '../dtos/reset-password-response.dto';
import { JwtAuthGuard } from '../guards/jwt.guard';
import { CurrentUser } from '../decorators/current-user.decorator';

import { CreateUserDto } from '../../user/dtos/create-user.dto';
import { UpdateUserDto } from '../../user/dtos/update-user.dto';
import { UserResponseDto } from '../../user/dtos/user.response.dto';
import { UserService } from '../../user/services/user.service';
import { AccountDeletionService } from '../../user/services/account-deletion.service';
import { PersonalDataExportService } from '../../user/services/personal-data-export.service';
import { PersonalDataExportDto } from '../../user/dtos/personal-data-export.dto';
import {
  AccountDeletionCancellationDto,
  AccountDeletionScheduleDto,
} from '../../user/dtos/account-deletion.dto';
import { User } from '../../user/entities/user.entity';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly accountDeletionService: AccountDeletionService,
    private readonly personalDataExportService: PersonalDataExportService,
  ) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UseGuards(ThrottlerGuard)
  @ApiOperation({
    summary: 'User login',
    description: 'Authenticates user and returns JWT token',
  })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 200, type: AuthResponseDto })
  @ApiBadRequestResponse({ description: 'Validation failed' })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials' })
  @ApiTooManyRequestsResponse({ description: 'Too many login attempts' })
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  async login(
    @Body(new ValidationPipe({ transform: true, whitelist: true }))
    loginDto: LoginDto,
  ): Promise<AuthResponseDto> {
    return this.authService.login(loginDto);
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(ThrottlerGuard)
  @ApiOperation({
    summary: 'User registration',
    description: 'Creates new user account and returns JWT token',
  })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({ status: 201, type: AuthResponseDto })
  @ApiBadRequestResponse({ description: 'Validation failed' })
  @ApiTooManyRequestsResponse({ description: 'Too many registration attempts' })
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  async register(
    @Body(new ValidationPipe({ transform: true, whitelist: true }))
    createUserDto: CreateUserDto,
  ): Promise<AuthResponseDto> {
    await this.userService.create(createUserDto);
    return this.authService.login({
      email: createUserDto.email,
      password: createUserDto.password,
    });
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, type: UserResponseDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  async getMe(@CurrentUser() user: User): Promise<UserResponseDto> {
    const completeUser = await this.userService.findById(user.id);
    return plainToInstance(UserResponseDto, completeUser);
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({ status: 200, type: UserResponseDto })
  @ApiBadRequestResponse({
    description: 'Validation failed or email/username exists',
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  async updateMe(
    @CurrentUser() user: User,
    @Body(new ValidationPipe({ transform: true, whitelist: true }))
    updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    const updatedUser = await this.userService.update(user.id, updateUserDto);
    return plainToInstance(UserResponseDto, updatedUser);
  }

  @Post('me/change-password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Change user password' })
  @ApiBody({ type: ChangePasswordDto })
  @ApiResponse({ status: 200, type: ChangePasswordResponseDto })
  @ApiUnauthorizedResponse({
    description: 'Invalid JWT token or old password incorrect',
  })
  @ApiBadRequestResponse({ description: 'New password validation failed' })
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
    return { message: 'Password changed successfully' };
  }

  @Post('me/deletion')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Schedule current account deletion' })
  @ApiResponse({ status: 200, type: AccountDeletionScheduleDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  async requestDeletion(
    @CurrentUser() user: User,
  ): Promise<AccountDeletionScheduleDto> {
    return this.accountDeletionService.requestDeletion(user.id);
  }

  @Delete('me/deletion')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Cancel pending current account deletion' })
  @ApiResponse({ status: 200, type: AccountDeletionCancellationDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  async cancelDeletion(
    @CurrentUser() user: User,
  ): Promise<AccountDeletionCancellationDto> {
    await this.accountDeletionService.cancelDeletion(user.id);
    return { message: 'Account deletion canceled' };
  }

  @Get('me/export')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Export current user personal data' })
  @ApiResponse({ status: 200, type: PersonalDataExportDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  async exportMe(@CurrentUser() user: User): Promise<PersonalDataExportDto> {
    return this.personalDataExportService.exportAccount(user.id);
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @ApiOperation({
    summary: 'Request a password-reset link by email',
    description:
      'Always returns 200 with a generic message regardless of whether the email exists, to prevent account enumeration. When the email is registered, a single-use token (1h lifetime) is issued and emitted to the application log (v0.1) — operators forward it manually until the email infrastructure ships in v0.2.',
  })
  @ApiBody({ type: ForgotPasswordDto })
  @ApiResponse({ status: 200, type: ForgotPasswordResponseDto })
  @ApiBadRequestResponse({ description: 'Email format invalid' })
  @ApiTooManyRequestsResponse({
    description: 'Too many reset requests in a short window',
  })
  async forgotPassword(
    @Body(new ValidationPipe({ transform: true, whitelist: true }))
    dto: ForgotPasswordDto,
  ): Promise<ForgotPasswordResponseDto> {
    return this.authService.requestPasswordReset(dto.email);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @ApiOperation({
    summary: 'Complete a password reset using a token from the email',
    description:
      'Validates the token (SHA-256 hash matched against the user table, expiry ≥ now), updates the password, and clears the in-flight reset state. Generic 400 if the token is unknown / expired / already used / belongs to a deactivated account.',
  })
  @ApiBody({ type: ResetPasswordDto })
  @ApiResponse({ status: 200, type: ResetPasswordResponseDto })
  @ApiBadRequestResponse({
    description:
      'Token invalid or expired, or new password fails validation rules',
  })
  @ApiTooManyRequestsResponse({
    description: 'Too many reset attempts in a short window',
  })
  async resetPassword(
    @Body(new ValidationPipe({ transform: true, whitelist: true }))
    dto: ResetPasswordDto,
  ): Promise<ResetPasswordResponseDto> {
    return this.authService.resetPassword(dto.token, dto.new_password);
  }
}
