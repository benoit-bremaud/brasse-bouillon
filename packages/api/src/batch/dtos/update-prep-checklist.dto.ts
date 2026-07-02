import { ApiProperty } from '@nestjs/swagger';
import { ArrayMaxSize, IsArray, IsString, MaxLength } from 'class-validator';

/**
 * Full replacement of the draft's checked prep-item ids (F14). Bounded so no
 * unbounded client payload is ever persisted: a checklist has one id per
 * recipe-ingredient row, far below the caps.
 */
export class UpdatePrepChecklistDto {
  @ApiProperty({
    type: String,
    isArray: true,
    example: ['a1b2-hop-cascade-60min-0'],
  })
  @IsArray()
  @ArrayMaxSize(200)
  @IsString({ each: true })
  @MaxLength(160, { each: true })
  checkedIds: string[];
}
