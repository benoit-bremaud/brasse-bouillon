import { ApiProperty } from '@nestjs/swagger';

import { MeasurementType } from '../domain/enums/measurement-type.enum';
import { MeasurementOrmEntity } from '../entities/measurement.orm.entity';

/** Serialised measurement returned by the API (#607). */
export class MeasurementDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  batch_id: string;

  @ApiProperty({ nullable: true })
  step_order: number | null;

  @ApiProperty({ enum: MeasurementType })
  type: MeasurementType;

  @ApiProperty()
  value: number;

  @ApiProperty({ nullable: true })
  unit: string | null;

  @ApiProperty()
  taken_at: Date;

  @ApiProperty()
  created_at: Date;

  static fromEntity(e: MeasurementOrmEntity): MeasurementDto {
    return {
      id: e.id,
      batch_id: e.batch_id,
      step_order: e.step_order ?? null,
      type: e.type,
      value: e.value,
      unit: e.unit ?? null,
      taken_at: e.taken_at,
      created_at: e.created_at,
    };
  }
}
