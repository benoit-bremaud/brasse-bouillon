import { MeasurementDto } from './measurement.dto';
import { MeasurementType } from '../domain/enums/measurement-type.enum';
import { MeasurementOrmEntity } from '../entities/measurement.orm.entity';

describe('MeasurementDto.fromEntity', () => {
  const base: MeasurementOrmEntity = {
    id: 'm-1',
    batch_id: 'b-1',
    step_order: 2,
    type: MeasurementType.OG,
    value: 1.048,
    unit: 'SG',
    taken_at: new Date('2026-05-20T10:00:00.000Z'),
    created_at: new Date('2026-05-20T10:00:01.000Z'),
  };

  // Happy path: full entity maps field-for-field.
  it('maps every field of a fully populated entity', () => {
    expect(MeasurementDto.fromEntity(base)).toEqual({
      id: 'm-1',
      batch_id: 'b-1',
      step_order: 2,
      type: MeasurementType.OG,
      value: 1.048,
      unit: 'SG',
      taken_at: base.taken_at,
      created_at: base.created_at,
    });
  });

  // Edge: nullable optionals normalise to null.
  it('normalises absent step_order/unit to null', () => {
    const dto = MeasurementDto.fromEntity({
      ...base,
      step_order: null,
      unit: null,
    });

    expect(dto.step_order).toBeNull();
    expect(dto.unit).toBeNull();
  });
});
