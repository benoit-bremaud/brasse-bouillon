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
import { PasswordService } from '../services/password.service';
import { JwtAuthGuard } from '../guards/jwt.guard';
import { CurrentUser } from '../decorators/current-user.decorator';

import { CreateUserDto } from '../../user/dtos/create-user.dto';
import { UpdateUserDto } from '../../user/dtos/update-user.dto';
import { UserResponseDto } from '../../user/dtos/user.response.dto';
import { UserService } from '../../user/services/user.service';
import { User } from '../../user/entities/user.entity';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly passwordService: PasswordService,
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

  @Delete('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete user account' })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  async deleteMe(@CurrentUser() user: User): Promise<{ message: string }> {
    await this.userService.delete(user.id);
    return { message: 'User deleted successfully' };
  }
}
