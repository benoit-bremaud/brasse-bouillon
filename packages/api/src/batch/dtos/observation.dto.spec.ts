import { ObservationDto } from './observation.dto';
import { ObservationOrmEntity } from '../entities/observation.orm.entity';

describe('ObservationDto.fromEntity', () => {
  const base: ObservationOrmEntity = {
    id: 'o-1',
    batch_id: 'b-1',
    step_order: 2,
    free_text: 'Krausen bien formé',
    photo_refs: ['photos/1.jpg'],
    mood_score: 4,
    observed_at: new Date('2026-05-20T18:00:00.000Z'),
    created_at: new Date('2026-05-20T18:00:01.000Z'),
  };

  // Happy path: full entity maps field-for-field.
  it('maps every field of a fully populated entity', () => {
    expect(ObservationDto.fromEntity(base)).toEqual({
      id: 'o-1',
      batch_id: 'b-1',
      step_order: 2,
      free_text: 'Krausen bien formé',
      photo_refs: ['photos/1.jpg'],
      mood_score: 4,
      observed_at: base.observed_at,
      created_at: base.created_at,
    });
  });

  // Edge: nullable optionals normalise to null, missing photos to [].
  it('normalises absent step_order/mood_score to null and photo_refs to []', () => {
    const dto = ObservationDto.fromEntity({
      ...base,
      step_order: null,
      mood_score: null,
      photo_refs: null as unknown as string[],
    });

    expect(dto.step_order).toBeNull();
    expect(dto.mood_score).toBeNull();
    expect(dto.photo_refs).toEqual([]);
  });
});
