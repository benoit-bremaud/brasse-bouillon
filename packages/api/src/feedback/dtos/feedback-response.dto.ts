import { ApiProperty } from '@nestjs/swagger';

import type { TopLevelCategory } from '../feedback.constants';

/**
 * Feedback Response DTO — the minimal acknowledgement returned after a
 * successful submission. Deliberately does not echo the stored context
 * (url, userAgent, sessionId, …) back to the caller.
 */
export class FeedbackResponseDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  id: string;

  @ApiProperty({ example: 'bug' })
  category: TopLevelCategory;

  @ApiProperty({ nullable: true, example: 'broken-feature' })
  subCategory: string | null;

  @ApiProperty({ example: '2026-05-21T10:15:00.000Z' })
  createdAt: Date;
}
