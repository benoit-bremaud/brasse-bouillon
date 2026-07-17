import { ApiProperty } from '@nestjs/swagger';

export class AccountDeletionScheduleDto {
  @ApiProperty({ example: 'scheduled' })
  status!: 'scheduled';

  @ApiProperty()
  requested_at!: Date;

  @ApiProperty()
  scheduled_for!: Date;

  @ApiProperty({ example: 30 })
  grace_period_days!: number;
}

export class AccountDeletionCancellationDto {
  @ApiProperty({ example: 'Account deletion canceled' })
  message!: string;
}
