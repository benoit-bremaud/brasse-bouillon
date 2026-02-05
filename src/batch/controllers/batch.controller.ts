import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
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
import { BatchSummaryDto } from '../dtos/batch-summary.dto';
import { StartBatchDto } from '../dtos/start-batch.dto';
import { BatchService } from '../services/batch.service';

@ApiTags('Batches')
@ApiBearerAuth()
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
}
