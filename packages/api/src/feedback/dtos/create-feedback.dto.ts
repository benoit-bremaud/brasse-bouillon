import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsISO8601,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';

import {
  FEEDBACK_MESSAGE_MAX_LENGTH,
  FEEDBACK_MESSAGE_MIN_LENGTH,
  TOP_LEVEL_CATEGORIES,
  type TopLevelCategory,
} from '../feedback.constants';
import { IsValidSubCategory } from '../validators/is-valid-sub-category.validator';

/**
 * Viewport dimensions, mirrors the widget's `ViewportSize`.
 */
export class FeedbackViewportDto {
  @ApiProperty({ example: 1280, description: 'Viewport width in CSS pixels' })
  @IsInt()
  @Min(0)
  @Max(100_000)
  w: number;

  @ApiProperty({ example: 800, description: 'Viewport height in CSS pixels' })
  @IsInt()
  @Min(0)
  @Max(100_000)
  h: number;
}

/**
 * Create Feedback DTO — mirrors the `feedback-widget` `FeedbackPayload`
 * wire contract (`BrowserContext & CategorizedFeedback & { message }`).
 *
 * The global `ValidationPipe` runs with `forbidNonWhitelisted: true`,
 * so this DTO must match the widget payload field-for-field: any extra
 * property in the body is rejected with a 400. `reporterName` is
 * deliberately absent — it is collected in the widget UI but not part
 * of the transmitted payload at v0.1.
 */
export class CreateFeedbackDto {
  @ApiProperty({
    example: 'brasse-bouillon-website',
    description: 'Source project identifier set by the widget',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  projectId: string;

  @ApiProperty({
    enum: TOP_LEVEL_CATEGORIES,
    example: 'bug',
    description: 'Top-level feedback category',
  })
  @IsEnum(TOP_LEVEL_CATEGORIES)
  category: TopLevelCategory;

  @ApiProperty({
    nullable: true,
    example: 'broken-feature',
    description:
      'Sub-category; must match the chosen category, or null for "other"',
  })
  @IsValidSubCategory()
  subCategory: string | null;

  @ApiProperty({
    example: 'The download button does nothing on Android 13.',
    minLength: FEEDBACK_MESSAGE_MIN_LENGTH,
    maxLength: FEEDBACK_MESSAGE_MAX_LENGTH,
  })
  @IsString()
  @MinLength(FEEDBACK_MESSAGE_MIN_LENGTH)
  @MaxLength(FEEDBACK_MESSAGE_MAX_LENGTH)
  message: string;

  @ApiProperty({ example: 'https://brasse-bouillon.com/download' })
  @IsString()
  @MaxLength(2048)
  url: string;

  @ApiProperty({ nullable: true, example: 'https://brasse-bouillon.com/' })
  @IsOptional()
  @IsString()
  @MaxLength(2048)
  referrer: string | null;

  @ApiProperty({ example: 'Mozilla/5.0 (...)' })
  @IsString()
  @MaxLength(512)
  userAgent: string;

  @ApiProperty({ type: FeedbackViewportDto })
  @ValidateNested()
  @Type(() => FeedbackViewportDto)
  viewport: FeedbackViewportDto;

  @ApiProperty({ example: 'fr-FR' })
  @IsString()
  @MaxLength(20)
  locale: string;

  @ApiProperty({
    example: '2026-05-21T10:15:00.000Z',
    description: 'ISO-8601 timestamp set client-side at submission',
  })
  @IsISO8601()
  timestamp: string;

  @ApiProperty({ example: '0.2.0' })
  @IsString()
  @MaxLength(40)
  widgetVersion: string;

  @ApiProperty({
    example: 0.42,
    minimum: 0,
    maximum: 1,
    description: 'Scroll depth ratio (0 = top, 1 = fully scrolled)',
  })
  @IsNumber()
  @Min(0)
  @Max(1)
  scrollDepth: number;

  @ApiProperty({ example: 'sess_8f3a1c…' })
  @IsString()
  @MaxLength(128)
  sessionId: string;
}
