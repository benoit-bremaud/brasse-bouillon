import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

/** Body for recording the first tasting of a finished batch (B3). */
export class CreateTastingDto {
  @ApiProperty({ minimum: 1, maximum: 5, example: 4 })
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiProperty({ required: false, example: 'Belle mousse, finale fruitée.' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  note?: string;
}
