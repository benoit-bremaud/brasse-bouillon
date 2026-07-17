import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

import { User } from '../entities/user.entity';
import {
  PersonalDataExportAccountDto,
  PersonalDataExportDto,
  type PersonalDataExportRecord,
} from '../dtos/personal-data-export.dto';
import { UserService } from './user.service';

const EXPORT_SCHEMA_VERSION = '1.0';

function isRecord(value: unknown): value is PersonalDataExportRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function parseRows(value: unknown): PersonalDataExportRecord[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((row) => (isRecord(row) ? [row] : []));
}

function toAccountExport(user: User): PersonalDataExportAccountDto {
  return {
    id: user.id,
    email: user.email,
    username: user.username,
    first_name: user.first_name ?? null,
    last_name: user.last_name ?? null,
    bio: user.bio ?? null,
    created_at: user.created_at,
    updated_at: user.updated_at,
  };
}

/**
 * Builds the authenticated data-rights export from the API-owned aggregates.
 * Local-only preferences and consent are merged by the mobile boundary.
 */
@Injectable()
export class PersonalDataExportService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly userService: UserService,
  ) {}

  async exportAccount(userId: string): Promise<PersonalDataExportDto> {
    const user = await this.userService.findById(userId);
    const [
      recipes,
      recipeComponents,
      batches,
      batchRecords,
      equipmentProfiles,
      labelDrafts,
      scans,
      scanImages,
    ] = await Promise.all([
      this.queryRows(
        `SELECT id, owner_id, name, description, visibility, version,
                root_recipe_id, parent_recipe_id, batch_size_l, boil_time_min,
                og_target, fg_target, abv_estimated, ibu_target, ebc_target,
                efficiency_target, difficulty_computed, difficulty_override,
                difficulty_reasons, avg_rating, brew_count, last_brewed_at,
                is_official, style, imported_from_recipe_id, import_provenance,
                created_at, updated_at
           FROM recipes
          WHERE owner_id = ?
          ORDER BY created_at ASC`,
        [userId],
      ),
      this.queryRecipeComponents(userId),
      this.queryRows(
        `SELECT id, owner_id, recipe_id, name, notes, target_volume_l,
                final_volume_l, og_actual, fg_actual, abv_actual, status,
                current_step_order, started_at, fermentation_started_at,
                fermentation_completed_at, bottled_at, completed_at,
                cancelled_at, archived_at, launched_at, prep_checked_ids,
                created_at, updated_at
           FROM batches
          WHERE owner_id = ?
          ORDER BY created_at ASC`,
        [userId],
      ),
      this.queryBatchRecords(userId),
      this.queryRows(
        `SELECT id, owner_id, name, mash_tun_volume_l, boil_kettle_volume_l,
                fermenter_volume_l, trub_loss_l, dead_space_loss_l,
                transfer_loss_l, evaporation_rate_l_per_hour,
                efficiency_estimated_percent, efficiency_measured_percent,
                cooling_time_minutes, cooling_flow_rate_l_per_minute,
                system_type, created_at, updated_at
           FROM equipment_profiles
          WHERE owner_id = ?
          ORDER BY created_at ASC`,
        [userId],
      ),
      this.queryRows(
        `SELECT id, owner_id, batch_id, status, bottle_format, template_id,
                editable_fields, preview_snapshot, version, deleted_at,
                created_at, updated_at
           FROM label_drafts
          WHERE owner_id = ?
          ORDER BY created_at ASC`,
        [userId],
      ),
      this.queryRows(
        `SELECT id, owner_id, barcode, status, consent_ai_training,
                retention_until, catalog_item_id, created_at, updated_at
           FROM scan_requests
          WHERE owner_id = ?
          ORDER BY created_at ASC`,
        [userId],
      ),
      this.queryRows(
        `SELECT images.id, images.scan_request_id, images.face,
                images.mime_type, images.size_bytes, images.created_at,
                images.updated_at
           FROM scan_label_images images
           JOIN scan_requests scans ON scans.id = images.scan_request_id
          WHERE scans.owner_id = ?
          ORDER BY images.created_at ASC`,
        [userId],
      ),
    ]);

    return {
      schema_version: EXPORT_SCHEMA_VERSION,
      exported_at: new Date(),
      account: toAccountExport(user),
      recipes,
      recipe_components: recipeComponents,
      batches,
      batch_records: batchRecords,
      equipment_profiles: equipmentProfiles,
      label_drafts: labelDrafts,
      scans,
      scan_images: scanImages,
    };
  }

  private async queryRows(
    query: string,
    parameters: string[],
  ): Promise<PersonalDataExportRecord[]> {
    const rows: unknown = await this.dataSource.query(query, parameters);
    return parseRows(rows);
  }

  private async queryRecipeComponents(
    userId: string,
  ): Promise<PersonalDataExportRecord[]> {
    const [fermentables, additives, hops, yeasts, steps, water] =
      await Promise.all([
        this.queryRows(
          `SELECT item.*
             FROM recipe_fermentables item
             JOIN recipes ON recipes.id = item.recipe_id
            WHERE recipes.owner_id = ?`,
          [userId],
        ),
        this.queryRows(
          `SELECT item.*
             FROM recipe_additives item
             JOIN recipes ON recipes.id = item.recipe_id
            WHERE recipes.owner_id = ?`,
          [userId],
        ),
        this.queryRows(
          `SELECT item.*
             FROM recipe_hops item
             JOIN recipes ON recipes.id = item.recipe_id
            WHERE recipes.owner_id = ?`,
          [userId],
        ),
        this.queryRows(
          `SELECT item.*
             FROM recipe_yeasts item
             JOIN recipes ON recipes.id = item.recipe_id
            WHERE recipes.owner_id = ?`,
          [userId],
        ),
        this.queryRows(
          `SELECT item.*
             FROM recipe_steps item
             JOIN recipes ON recipes.id = item.recipe_id
            WHERE recipes.owner_id = ?`,
          [userId],
        ),
        this.queryRows(
          `SELECT item.*
             FROM recipe_water item
             JOIN recipes ON recipes.id = item.recipe_id
            WHERE recipes.owner_id = ?`,
          [userId],
        ),
      ]);

    return [
      ...this.tagRows(fermentables, 'fermentable'),
      ...this.tagRows(additives, 'additive'),
      ...this.tagRows(hops, 'hop'),
      ...this.tagRows(yeasts, 'yeast'),
      ...this.tagRows(steps, 'step'),
      ...this.tagRows(water, 'water'),
    ];
  }

  private async queryBatchRecords(
    userId: string,
  ): Promise<PersonalDataExportRecord[]> {
    const tableNames = [
      ['batch_steps', 'step'],
      ['batch_measurements', 'measurement'],
      ['batch_observations', 'observation'],
      ['batch_tastings', 'tasting'],
      ['batch_reminders', 'reminder'],
      ['batch_alerts', 'alert'],
    ] as const;

    const records = await Promise.all(
      tableNames.map(([tableName, kind]) =>
        this.queryRows(
          `SELECT item.*
             FROM ${tableName} item
             JOIN batches ON batches.id = item.batch_id
            WHERE batches.owner_id = ?`,
          [userId],
        ).then((rows) => this.tagRows(rows, kind)),
      ),
    );

    return records.flat();
  }

  private tagRows(
    rows: PersonalDataExportRecord[],
    kind: string,
  ): PersonalDataExportRecord[] {
    return rows.map((row) => ({ ...row, kind }));
  }
}
