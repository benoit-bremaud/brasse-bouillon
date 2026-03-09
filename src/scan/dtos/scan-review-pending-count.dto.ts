import { ApiProperty } from '@nestjs/swagger';

export class ScanReviewPendingCountDto {
  @ApiProperty({ example: 3 })
  pending: number;
}
