import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { JwtAuthGuard } from '../../auth/guards/jwt.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { User } from '../../user/entities/user.entity';

import { EquipmentProfileService } from '../services/equipment-profile.service';
import { CreateEquipmentProfileDto } from '../dtos/create-equipment-profile.dto';
import { UpdateEquipmentProfileDto } from '../dtos/update-equipment-profile.dto';
import { EquipmentProfileDto } from '../dtos/equipment-profile.dto';

/**
 * EquipmentProfileController
 *
 * Route prefix: /equipment-profiles
 * Ownership: all endpoints are scoped to the authenticated user (owner_id = user.id)
 */
@ApiTags('Equipment')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('equipment-profiles')
export class EquipmentProfileController {
  constructor(private readonly service: EquipmentProfileService) {}

  @Get('ping')
  @ApiOperation({ summary: 'Ping equipment module (JWT protected)' })
  @ApiOkResponse({ description: 'Equipment module is reachable' })
  ping(): { ok: true } {
    return this.service.ping();
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create an equipment profile (current user)' })
  @ApiCreatedResponse({ type: EquipmentProfileDto })
  async create(
    @CurrentUser() user: User,
    @Body(new ValidationPipe({ transform: true, whitelist: true }))
    dto: CreateEquipmentProfileDto,
  ): Promise<EquipmentProfileDto> {
    const saved = await this.service.create(user.id, dto);
    return EquipmentProfileDto.fromEntity(saved);
  }

  @Get()
  @ApiOperation({ summary: 'List my equipment profiles' })
  @ApiOkResponse({ type: EquipmentProfileDto, isArray: true })
  async listMine(@CurrentUser() user: User): Promise<EquipmentProfileDto[]> {
    const rows = await this.service.listMine(user.id);
    return rows.map((row) => EquipmentProfileDto.fromEntity(row));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get one of my equipment profiles by id' })
  @ApiOkResponse({ type: EquipmentProfileDto })
  async getMineById(
    @CurrentUser() user: User,
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<EquipmentProfileDto> {
    const row = await this.service.getMineById(user.id, id);
    return EquipmentProfileDto.fromEntity(row);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update one of my equipment profiles' })
  @ApiOkResponse({ type: EquipmentProfileDto })
  async updateMine(
    @CurrentUser() user: User,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body(new ValidationPipe({ transform: true, whitelist: true }))
    dto: UpdateEquipmentProfileDto,
  ): Promise<EquipmentProfileDto> {
    const saved = await this.service.updateMine(user.id, id, dto);
    return EquipmentProfileDto.fromEntity(saved);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete one of my equipment profiles' })
  @ApiOkResponse({ description: 'Deleted' })
  async deleteMine(
    @CurrentUser() user: User,
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<{ deleted: true }> {
    return this.service.deleteMine(user.id, id);
  }
}
