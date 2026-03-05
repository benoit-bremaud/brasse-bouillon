import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseUUIDPipe,
  ValidationPipe,
  UseGuards,
  ConflictException,
  Headers,
  Logger,
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
import { ConfigService } from '@nestjs/config';

import { UserService } from '../services/user.service';
import { UpdateUserDto } from '../dtos/update-user.dto';
import { UserResponseDto } from '../dtos/user.response.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { UserRole } from '../../common/enums/role.enum';

@ApiTags('Users')
@Controller('users')
export class UserController {
  private readonly logger = new Logger(UserController.name);

  constructor(
    private readonly userService: UserService,
    private readonly configService: ConfigService,
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get all users (ADMIN ONLY)' })
  @ApiResponse({ status: 200, type: [UserResponseDto] })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  @ApiForbiddenResponse({ description: 'User does not have ADMIN role' })
  async getAllUsers(): Promise<UserResponseDto[]> {
    this.logger.log('Admin route: fetching all users');
    const users = await this.userService.findAll();
    return plainToInstance(UserResponseDto, users);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get a user by ID (ADMIN ONLY)' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: 200, type: UserResponseDto })
  @ApiBadRequestResponse({ description: 'Invalid UUID format' })
  @ApiNotFoundResponse({ description: 'User not found in database' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  @ApiForbiddenResponse({ description: 'Requires ADMIN role' })
  async findById(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<UserResponseDto> {
    this.logger.log(`Admin fetching user ${id}`);
    const user = await this.userService.findById(id);
    return plainToInstance(UserResponseDto, user);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update a user profile (ADMIN ONLY)' })
  @ApiParam({ name: 'id' })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({ status: 200, type: UserResponseDto })
  @ApiBadRequestResponse({
    description: 'Invalid UUID format or validation failed',
  })
  @ApiNotFoundResponse({ description: 'User not found' })
  @ApiConflictResponse({ description: 'Email or username already in use' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  @ApiForbiddenResponse({ description: 'Requires ADMIN role' })
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body(new ValidationPipe({ transform: true, whitelist: true }))
    updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    this.logger.log(`Admin updating profile of user ${id}`);
    const updatedUser = await this.userService.update(id, updateUserDto);
    return plainToInstance(UserResponseDto, updatedUser);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete a user account (ADMIN ONLY)' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: 200 })
  @ApiBadRequestResponse({ description: 'Invalid UUID format' })
  @ApiNotFoundResponse({ description: 'User not found' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  @ApiForbiddenResponse({ description: 'Requires ADMIN role' })
  async delete(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<{ message: string }> {
    this.logger.log(`Admin deleting account of user ${id}`);
    await this.userService.delete(id);
    return { message: 'User deleted successfully' };
  }

  @ApiExcludeEndpoint()
  @Post('dev/seed-admin')
  @ApiOperation({ summary: 'Create Genesis Admin User (DEV ONLY)' })
  @ApiCreatedResponse({ description: 'Genesis admin created successfully' })
  @ApiConflictResponse({ description: 'Admin already exists' })
  async seedAdmin(
    @Headers('x-seed-token') seedToken?: string,
  ): Promise<UserResponseDto> {
    this.ensureSeedAccess(seedToken);
    this.logger.log('Seeding genesis admin user');

    const existingAdmin =
      await this.userService.findByEmail('admin@example.com');
    if (existingAdmin) {
      throw new ConflictException('Genesis Admin already exists!');
    }

    const admin = await this.userService.createAdmin(
      'admin@example.com',
      'admin',
      'AdminPassword123!',
      'Admin',
      'User',
    );

    this.logger.log(`Genesis admin created (id: ${admin.id})`);
    return plainToInstance(UserResponseDto, admin);
  }

  @ApiExcludeEndpoint()
  @Post('dev/seed-moderator')
  @ApiOperation({ summary: 'Create Moderator User (DEV ONLY)' })
  @ApiCreatedResponse({ description: 'Moderator created successfully' })
  @ApiConflictResponse({ description: 'Moderator already exists' })
  async seedModerator(
    @Headers('x-seed-token') seedToken?: string,
  ): Promise<UserResponseDto> {
    this.ensureSeedAccess(seedToken);
    this.logger.log('Seeding moderator user');

    const existingModerator = await this.userService.findByEmail(
      'moderator@example.com',
    );
    if (existingModerator) {
      throw new ConflictException('Moderator already exists!');
    }

    const moderator = await this.userService.createAdmin(
      'moderator@example.com',
      'moderator',
      'ModeratorPassword123!',
      'Moderator',
      'User',
    );

    const updatedModerator = await this.userService.updateUserRole(
      moderator.id,
      UserRole.MODERATOR,
    );

    this.logger.log(`Moderator user created (id: ${updatedModerator.id})`);
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
