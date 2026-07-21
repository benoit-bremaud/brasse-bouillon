import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

import { type PersonalDataExportRecord } from '../dtos/personal-data-export.dto';

function isRecord(value: unknown): value is PersonalDataExportRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function parseRows(value: unknown): PersonalDataExportRecord[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((row) => (isRecord(row) ? [row] : []));
}

/**
 * Owns every persistence read behind the authenticated personal-data export.
 * Keeping the parameterized SQL here (not in the service) satisfies the
 * api/CLAUDE.md rule "never use raw SQL outside repository / query-builder
 * methods": the service orchestrates and shapes the DTO, the repository is
 * the only place that talks to the database. Each method returns the owned
 * rows for a single user, projected to the columns the export ships (no
 * secrets — password hashes, reset tokens and roles never leave the table).
 */
@Injectable()
export class PersonalDataExportRepository {
  constructor(private readonly dataSource: DataSource) {}

  async findRecipes(userId: string): Promise<PersonalDataExportRecord[]> {
    return this.queryRows(
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
    );
  }

  async findRecipeComponents(
    userId: string,
  ): Promise<PersonalDataExportRecord[]> {
    const [fermentables, additives, hops, yeasts, steps, water] =
      await Promise.all([
        this.queryOwnedRecipeChildren('recipe_fermentables', userId),
        this.queryOwnedRecipeChildren('recipe_additives', userId),
        this.queryOwnedRecipeChildren('recipe_hops', userId),
        this.queryOwnedRecipeChildren('recipe_yeasts', userId),
        this.queryOwnedRecipeChildren('recipe_steps', userId),
        this.queryOwnedRecipeChildren('recipe_water', userId),
      ]);

    return [
      ...tagRows(fermentables, 'fermentable'),
      ...tagRows(additives, 'additive'),
      ...tagRows(hops, 'hop'),
      ...tagRows(yeasts, 'yeast'),
      ...tagRows(steps, 'step'),
      ...tagRows(water, 'water'),
    ];
  }

  async findBatches(userId: string): Promise<PersonalDataExportRecord[]> {
    return this.queryRows(
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
    );
  }

  async findBatchRecords(userId: string): Promise<PersonalDataExportRecord[]> {
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
        this.queryOwnedBatchChildren(tableName, userId).then((rows) =>
          tagRows(rows, kind),
        ),
      ),
    );

    return records.flat();
  }

  async findEquipmentProfiles(
    userId: string,
  ): Promise<PersonalDataExportRecord[]> {
    return this.queryRows(
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
    );
  }

  async findLabelDrafts(userId: string): Promise<PersonalDataExportRecord[]> {
    return this.queryRows(
      `SELECT id, owner_id, batch_id, status, bottle_format, template_id,
              editable_fields, preview_snapshot, version, deleted_at,
              created_at, updated_at
         FROM label_drafts
        WHERE owner_id = ?
        ORDER BY created_at ASC`,
      [userId],
    );
  }

  async findScans(userId: string): Promise<PersonalDataExportRecord[]> {
    return this.queryRows(
      `SELECT id, owner_id, barcode, status, consent_ai_training,
              retention_until, catalog_item_id, created_at, updated_at
         FROM scan_requests
        WHERE owner_id = ?
        ORDER BY created_at ASC`,
      [userId],
    );
  }

  async findScanImages(userId: string): Promise<PersonalDataExportRecord[]> {
    return this.queryRows(
      `SELECT images.id, images.scan_request_id, images.face,
              images.mime_type, images.size_bytes, images.created_at,
              images.updated_at
         FROM scan_label_images images
         JOIN scan_requests scans ON scans.id = images.scan_request_id
        WHERE scans.owner_id = ?
        ORDER BY images.created_at ASC`,
      [userId],
    );
  }

  private queryOwnedRecipeChildren(
    table:
      | 'recipe_fermentables'
      | 'recipe_additives'
      | 'recipe_hops'
      | 'recipe_yeasts'
      | 'recipe_steps'
      | 'recipe_water',
    userId: string,
  ): Promise<PersonalDataExportRecord[]> {
    // `table` is a compile-time literal union (never user input); the only
    // bound parameter is the owner id.
    return this.queryRows(
      `SELECT item.*
         FROM ${table} item
         JOIN recipes ON recipes.id = item.recipe_id
        WHERE recipes.owner_id = ?`,
      [userId],
    );
  }

  private queryOwnedBatchChildren(
    table:
      | 'batch_steps'
      | 'batch_measurements'
      | 'batch_observations'
      | 'batch_tastings'
      | 'batch_reminders'
      | 'batch_alerts',
    userId: string,
  ): Promise<PersonalDataExportRecord[]> {
    // `table` is a compile-time literal union (never user input); the only
    // bound parameter is the owner id.
    return this.queryRows(
      `SELECT item.*
         FROM ${table} item
         JOIN batches ON batches.id = item.batch_id
        WHERE batches.owner_id = ?`,
      [userId],
    );
  }

  private async queryRows(
    query: string,
    parameters: string[],
  ): Promise<PersonalDataExportRecord[]> {
    const rows: unknown = await this.dataSource.query(query, parameters);
    return parseRows(rows);
  }
}

function tagRows(
  rows: PersonalDataExportRecord[],
  kind: string,
): PersonalDataExportRecord[] {
  return rows.map((row) => ({ ...row, kind }));
}
