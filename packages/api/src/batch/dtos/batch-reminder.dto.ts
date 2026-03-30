import { ApiProperty } from '@nestjs/swagger';

import { BatchReminderStatus } from '../domain/enums/batch-reminder-status.enum';
import { BatchReminderOrmEntity } from '../entities/batch-reminder.orm.entity';

export class BatchReminderDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  batch_id: string;

  @ApiProperty()
  label: string;

  @ApiProperty()
  due_at: Date;

  @ApiProperty({ enum: BatchReminderStatus })
  status: BatchReminderStatus;

  @ApiProperty()
  created_at: Date;

  @ApiProperty()
  updated_at: Date;

  static fromEntity(e: BatchReminderOrmEntity): BatchReminderDto {
    return {
      id: e.id,
      batch_id: e.batch_id,
      label: e.label,
      due_at: e.due_at,
      status: e.status,
      created_at: e.created_at,
      updated_at: e.updated_at,
    };
  }
}
