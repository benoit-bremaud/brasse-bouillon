import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

import { BatchReminderStatus } from '../domain/enums/batch-reminder-status.enum';

export class UpdateBatchReminderDto {
  @ApiPropertyOptional({ example: 'Dry hop added' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  label?: string;

  @ApiPropertyOptional({ example: '2026-02-14T08:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  dueAt?: string;

  @ApiPropertyOptional({ enum: BatchReminderStatus })
  @IsOptional()
  @IsEnum(BatchReminderStatus)
  status?: BatchReminderStatus;
}
