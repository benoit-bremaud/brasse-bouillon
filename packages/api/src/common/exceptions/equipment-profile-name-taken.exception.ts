import { ConflictException } from '@nestjs/common';

/**
 * Equipment Profile Name Taken Exception
 *
 * Thrown when a user tries to create an equipment profile with a name they
 * already use for one of their own profiles. Names are unique per owner
 * (composite unique index on `owner_id` + `name`).
 *
 * HTTP Status: 409 Conflict
 */
export class EquipmentProfileNameTakenException extends ConflictException {
  constructor() {
    super('An equipment profile with this name already exists');
  }
}
