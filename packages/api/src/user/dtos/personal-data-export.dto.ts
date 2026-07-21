import { ApiProperty } from '@nestjs/swagger';

export type PersonalDataExportRecord = Record<string, unknown>;

export class PersonalDataExportAccountDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  email!: string;

  @ApiProperty()
  username!: string;

  @ApiProperty({ nullable: true })
  first_name!: string | null;

  @ApiProperty({ nullable: true })
  last_name!: string | null;

  @ApiProperty({ nullable: true })
  bio!: string | null;

  @ApiProperty()
  created_at!: Date;

  @ApiProperty()
  updated_at!: Date;
}

/**
 * Versioned, authenticated export of API-owned personal data.
 *
 * Passwords, password-reset state, authorization roles, internal moderation
 * notes, idempotency payloads, and server storage paths are deliberately not
 * part of this contract.
 */
export class PersonalDataExportDto {
  @ApiProperty({ example: '1.0' })
  schema_version!: string;

  @ApiProperty()
  exported_at!: Date;

  @ApiProperty({ type: PersonalDataExportAccountDto })
  account!: PersonalDataExportAccountDto;

  @ApiProperty({ type: [Object] })
  recipes!: PersonalDataExportRecord[];

  @ApiProperty({ type: [Object] })
  recipe_components!: PersonalDataExportRecord[];

  @ApiProperty({ type: [Object] })
  batches!: PersonalDataExportRecord[];

  @ApiProperty({ type: [Object] })
  batch_records!: PersonalDataExportRecord[];

  @ApiProperty({ type: [Object] })
  equipment_profiles!: PersonalDataExportRecord[];

  @ApiProperty({ type: [Object] })
  label_drafts!: PersonalDataExportRecord[];

  @ApiProperty({ type: [Object] })
  scans!: PersonalDataExportRecord[];

  @ApiProperty({ type: [Object] })
  scan_images!: PersonalDataExportRecord[];
}
