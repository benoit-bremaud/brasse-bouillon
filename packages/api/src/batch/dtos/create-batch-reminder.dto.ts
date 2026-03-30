import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateBatchReminderDto {
  @ApiProperty({ example: 'Check gravity' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  label: string;

  @ApiProperty({ example: '2026-02-12T08:00:00.000Z' })
  @IsDateString()
  dueAt: string;
}
