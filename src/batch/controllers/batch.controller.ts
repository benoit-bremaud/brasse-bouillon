import {
  Body,
  Controller,
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

import { BatchDto } from '../dtos/batch.dto';
import { BatchReminderDto } from '../dtos/batch-reminder.dto';
import { BatchSummaryDto } from '../dtos/batch-summary.dto';
import { CreateBatchReminderDto } from '../dtos/create-batch-reminder.dto';
import { StartBatchDto } from '../dtos/start-batch.dto';
import { UpdateBatchReminderDto } from '../dtos/update-batch-reminder.dto';
import { BatchService } from '../services/batch.service';

/**
 * BatchController
 *
 * Route prefix: /batches
 * Ownership: current user only (owner_id = user.id)
 */
@ApiTags('Batches')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('batches')
export class BatchController {
  constructor(private readonly service: BatchService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Start a batch from one of my recipes' })
  @ApiCreatedResponse({ type: BatchDto })
  async startMine(
    @CurrentUser() user: User,
    @Body(new ValidationPipe({ transform: true, whitelist: true }))
    dto: StartBatchDto,
  ): Promise<BatchDto> {
    const { batch, steps } = await this.service.startMine(
      user.id,
      dto.recipeId,
    );
    return BatchDto.fromEntities(batch, steps);
  }

  @Get()
  @ApiOperation({ summary: 'List my batches' })
  @ApiOkResponse({ type: BatchSummaryDto, isArray: true })
  async listMine(@CurrentUser() user: User): Promise<BatchSummaryDto[]> {
    const rows = await this.service.listMine(user.id);
    return rows.map((row) => BatchSummaryDto.fromEntity(row));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get one of my batches by id' })
  @ApiOkResponse({ type: BatchDto })
  async getMineById(
    @CurrentUser() user: User,
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<BatchDto> {
    const { batch, steps } = await this.service.getMineById(user.id, id);
    return BatchDto.fromEntities(batch, steps);
  }

  @Post(':id/steps/current/complete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Complete the current batch step' })
  @ApiOkResponse({ type: BatchDto })
  async completeMineCurrentStep(
    @CurrentUser() user: User,
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<BatchDto> {
    const { batch, steps } = await this.service.completeMineCurrentStep(
      user.id,
      id,
    );
    return BatchDto.fromEntities(batch, steps);
  }

  @Post(':id/fermentation/start')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Start fermentation for one of my batches' })
  @ApiOkResponse({ type: BatchSummaryDto })
  async startFermentationMine(
    @CurrentUser() user: User,
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<BatchSummaryDto> {
    const batch = await this.service.startFermentationMine(user.id, id);
    return BatchSummaryDto.fromEntity(batch);
  }

  @Post(':id/fermentation/complete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Complete fermentation for one of my batches' })
  @ApiOkResponse({ type: BatchSummaryDto })
  async completeFermentationMine(
    @CurrentUser() user: User,
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<BatchSummaryDto> {
    const batch = await this.service.completeFermentationMine(user.id, id);
    return BatchSummaryDto.fromEntity(batch);
  }

  @Get(':id/reminders')
  @ApiOperation({ summary: 'List reminders for one of my batches' })
  @ApiOkResponse({ type: BatchReminderDto, isArray: true })
  async listMineReminders(
    @CurrentUser() user: User,
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<BatchReminderDto[]> {
    const rows = await this.service.listMineReminders(user.id, id);
    return rows.map((row) => BatchReminderDto.fromEntity(row));
  }

  @Post(':id/reminders')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a reminder for one of my batches' })
  @ApiCreatedResponse({ type: BatchReminderDto })
  async createMineReminder(
    @CurrentUser() user: User,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body(new ValidationPipe({ transform: true, whitelist: true }))
    dto: CreateBatchReminderDto,
  ): Promise<BatchReminderDto> {
    const saved = await this.service.createMineReminder(user.id, id, {
      label: dto.label,
      dueAt: new Date(dto.dueAt),
    });
    return BatchReminderDto.fromEntity(saved);
  }

  @Patch(':id/reminders/:reminderId')
  @ApiOperation({ summary: 'Update a reminder for one of my batches' })
  @ApiOkResponse({ type: BatchReminderDto })
  async updateMineReminder(
    @CurrentUser() user: User,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Param('reminderId', new ParseUUIDPipe()) reminderId: string,
    @Body(new ValidationPipe({ transform: true, whitelist: true }))
    dto: UpdateBatchReminderDto,
  ): Promise<BatchReminderDto> {
    const updated = await this.service.updateMineReminder(
      user.id,
      id,
      reminderId,
      {
        label: dto.label,
        dueAt: dto.dueAt ? new Date(dto.dueAt) : undefined,
        status: dto.status,
      },
    );
    return BatchReminderDto.fromEntity(updated);
  }
}
