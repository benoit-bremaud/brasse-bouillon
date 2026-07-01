import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
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
import { CreateMeasurementDto } from '../dtos/create-measurement.dto';
import { CreateObservationDto } from '../dtos/create-observation.dto';
import { MeasurementDto } from '../dtos/measurement.dto';
import { ObservationDto } from '../dtos/observation.dto';
import { CreateTastingDto } from '../dtos/create-tasting.dto';
import { GetPrimingQueryDto } from '../dtos/get-priming-query.dto';
import { PrimingDto } from '../dtos/priming.dto';
import { StartBatchDto } from '../dtos/start-batch.dto';
import { TastingDto } from '../dtos/tasting.dto';
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

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete one of my batches by id' })
  @ApiNoContentResponse({ description: 'Batch deleted' })
  async deleteMine(
    @CurrentUser() user: User,
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<void> {
    await this.service.deleteMine(user.id, id);
  }

  @Post(':id/steps/current/start')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Activate the current batch step (PRÉP → ACTIF)' })
  @ApiOkResponse({ type: BatchDto })
  async startMineCurrentStep(
    @CurrentUser() user: User,
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<BatchDto> {
    const { batch, steps } = await this.service.startMineCurrentStep(
      user.id,
      id,
    );
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

  @Get(':id/measurements')
  @ApiOperation({ summary: 'List measurements for one of my batches' })
  @ApiOkResponse({ type: MeasurementDto, isArray: true })
  async listMineMeasurements(
    @CurrentUser() user: User,
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<MeasurementDto[]> {
    const rows = await this.service.listMineMeasurements(user.id, id);
    return rows.map((row) => MeasurementDto.fromEntity(row));
  }

  @Post(':id/measurements')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Record a measurement on one of my batches' })
  @ApiCreatedResponse({ type: MeasurementDto })
  async createMineMeasurement(
    @CurrentUser() user: User,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body(new ValidationPipe({ transform: true, whitelist: true }))
    dto: CreateMeasurementDto,
  ): Promise<MeasurementDto> {
    const saved = await this.service.createMineMeasurement(user.id, id, {
      type: dto.type,
      value: dto.value,
      stepOrder: dto.stepOrder,
      unit: dto.unit,
      takenAt: dto.takenAt ? new Date(dto.takenAt) : undefined,
    });
    return MeasurementDto.fromEntity(saved);
  }

  @Get(':id/observations')
  @ApiOperation({ summary: 'List observations for one of my batches' })
  @ApiOkResponse({ type: ObservationDto, isArray: true })
  async listMineObservations(
    @CurrentUser() user: User,
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<ObservationDto[]> {
    const rows = await this.service.listMineObservations(user.id, id);
    return rows.map((row) => ObservationDto.fromEntity(row));
  }

  @Post(':id/observations')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Log an observation on one of my batches' })
  @ApiCreatedResponse({ type: ObservationDto })
  async createMineObservation(
    @CurrentUser() user: User,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body(new ValidationPipe({ transform: true, whitelist: true }))
    dto: CreateObservationDto,
  ): Promise<ObservationDto> {
    const saved = await this.service.createMineObservation(user.id, id, {
      freeText: dto.freeText,
      stepOrder: dto.stepOrder,
      photoRefs: dto.photoRefs,
      moodScore: dto.moodScore,
      observedAt: dto.observedAt ? new Date(dto.observedAt) : undefined,
    });
    return ObservationDto.fromEntity(saved);
  }

  @Get(':id/priming')
  @ApiOperation({
    summary: 'Get the priming-sugar guidance for one of my batches',
  })
  @ApiOkResponse({ type: PrimingDto })
  async getMinePriming(
    @CurrentUser() user: User,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Query(new ValidationPipe({ transform: true, whitelist: true }))
    query: GetPrimingQueryDto,
  ): Promise<PrimingDto> {
    const result = await this.service.getMinePriming(user.id, id, {
      targetCo2Vol: query.targetCo2Vol,
      beerTempC: query.beerTempC,
    });
    return PrimingDto.fromResult(result);
  }

  @Post(':id/bottling/close')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Bottle and close one of my batches' })
  @ApiOkResponse({ type: BatchDto })
  async closeMineBottling(
    @CurrentUser() user: User,
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<BatchDto> {
    const { batch, steps } = await this.service.closeMineBottling(user.id, id);
    return BatchDto.fromEntities(batch, steps);
  }

  @Get(':id/tasting')
  @ApiOperation({ summary: 'Get the tasting of one of my batches' })
  @ApiOkResponse({ type: TastingDto })
  async getMineTasting(
    @CurrentUser() user: User,
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<TastingDto> {
    const tasting = await this.service.getMineTasting(user.id, id);
    if (!tasting) {
      throw new NotFoundException('Tasting not found');
    }
    return TastingDto.fromEntity(tasting);
  }

  @Post(':id/tasting')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Record the first tasting of one of my batches' })
  @ApiCreatedResponse({ type: TastingDto })
  async createMineTasting(
    @CurrentUser() user: User,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body(new ValidationPipe({ transform: true, whitelist: true }))
    dto: CreateTastingDto,
  ): Promise<TastingDto> {
    const saved = await this.service.createMineTasting(user.id, id, {
      rating: dto.rating,
      note: dto.note,
    });
    return TastingDto.fromEntity(saved);
  }
}
