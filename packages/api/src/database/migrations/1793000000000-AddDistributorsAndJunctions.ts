import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Creates the `distributors` reference table + 5 M:N junction
 * tables linking distributors to the 5 catalogues that benefit
 * from the boutique 'Acheter' button (Issue #901).
 *
 * **Producer ≠ Distributor**: producers (PR #902) are brand
 * owners — 1 product = 1 producer, FK 1:1 on catalogues.
 * Distributors are resellers — 1 product = N distributors,
 * M:N junctions per catalogue.
 *
 * **M:N pattern (sets the codebase precedent)**:
 *   - Composite PK on `(catalogue_id, distributor_id)` —
 *     canonical M:N, no business meaning of a row alone,
 *     prevents duplicates by definition.
 *   - Business fields (`product_url`, `sku`,
 *     `notes_per_distributor`) live on the composite PK row.
 *   - `ON DELETE CASCADE` on both sides — if a distributor
 *     goes out of business or a catalogue entry is removed,
 *     the link goes too. No orphan junction rows possible.
 *
 * **CHECK constraints applied**:
 *   - `distributors.country` matches ISO 3166-1 alpha-2
 *     (2 uppercase ASCII letters)
 *   - `distributors.currency_default` matches ISO 4217
 *     (3 uppercase ASCII letters)
 *   - Every junction's `product_url` starts with `https://`
 *     (no `http://` mixed-content risk on the mobile WebView)
 *
 * **Index strategy**:
 *   - `IDX_distributors_name` UNIQUE for the name-lookup
 *     (and prevents accidental duplicate seeds)
 *   - `IDX_distributors_country` for country-faceted queries
 *   - Each junction gets `IDX_<table>_distributor_id` for fast
 *     reverse lookup ("which catalogue entries does this
 *     distributor sell?"). The composite PK already covers
 *     forward lookup ("which distributors sell this entry?").
 */
export class AddDistributorsAndJunctions1793000000000 implements MigrationInterface {
  name = 'AddDistributorsAndJunctions1793000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // ─── 1. Create the distributors reference table ─────────────────
    await queryRunner.query(`
      CREATE TABLE "distributors" (
        "id"               varchar(36) PRIMARY KEY NOT NULL,
        "name"             varchar(120) NOT NULL,
        "country"          varchar(2) NOT NULL,
        "website"          varchar(255) NOT NULL,
        "ships_to"         text NOT NULL,
        "currency_default" varchar(3) NOT NULL,
        "notes"            text,
        "created_at"       datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at"       datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "CHK_distributors_country"
          CHECK ("country" GLOB '[A-Z][A-Z]' AND length("country") = 2),
        CONSTRAINT "CHK_distributors_currency"
          CHECK ("currency_default" GLOB '[A-Z][A-Z][A-Z]' AND length("currency_default") = 3),
        CONSTRAINT "CHK_distributors_website_https"
          CHECK ("website" LIKE 'https://%')
      )
    `);
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_distributors_name" ON "distributors" ("name")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_distributors_country" ON "distributors" ("country")`,
    );

    // ─── 2. Create the 5 M:N junction tables ────────────────────────
    // Each follows the canonical pattern: composite PK +
    // ON DELETE CASCADE on both FKs + https-only product_url
    // CHECK + reverse-lookup index on distributor_id.
    const junctions: Array<{
      table: string;
      catalogueColumn: string;
      catalogueTable: string;
    }> = [
      {
        table: 'hop_distributors',
        catalogueColumn: 'hop_id',
        catalogueTable: 'hops',
      },
      {
        table: 'fermentable_distributors',
        catalogueColumn: 'fermentable_id',
        catalogueTable: 'fermentables',
      },
      {
        table: 'yeast_distributors',
        catalogueColumn: 'yeast_id',
        catalogueTable: 'yeasts',
      },
      {
        table: 'misc_template_distributors',
        catalogueColumn: 'misc_template_id',
        catalogueTable: 'misc_templates',
      },
      {
        table: 'equipment_template_distributors',
        catalogueColumn: 'equipment_template_id',
        catalogueTable: 'equipment_templates',
      },
    ];

    for (const j of junctions) {
      await queryRunner.query(`
        CREATE TABLE "${j.table}" (
          "${j.catalogueColumn}"     varchar(36) NOT NULL,
          "distributor_id"           varchar(36) NOT NULL,
          "product_url"              varchar(500) NOT NULL,
          "sku"                      varchar(80),
          "notes_per_distributor"    text,
          "created_at"               datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updated_at"               datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
          PRIMARY KEY ("${j.catalogueColumn}", "distributor_id"),
          FOREIGN KEY ("${j.catalogueColumn}")
            REFERENCES "${j.catalogueTable}"("id") ON DELETE CASCADE,
          FOREIGN KEY ("distributor_id")
            REFERENCES "distributors"("id") ON DELETE CASCADE,
          CONSTRAINT "CHK_${j.table}_url_https"
            CHECK ("product_url" LIKE 'https://%')
        )
      `);
      await queryRunner.query(
        `CREATE INDEX "IDX_${j.table}_distributor_id" ON "${j.table}" ("distributor_id")`,
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop junctions first (their FKs reference distributors),
    // then the distributors table itself.
    const junctions = [
      'equipment_template_distributors',
      'misc_template_distributors',
      'yeast_distributors',
      'fermentable_distributors',
      'hop_distributors',
    ];
    for (const table of junctions) {
      await queryRunner.query(`DROP INDEX "IDX_${table}_distributor_id"`);
      await queryRunner.query(`DROP TABLE "${table}"`);
    }
    await queryRunner.query(`DROP INDEX "IDX_distributors_country"`);
    await queryRunner.query(`DROP INDEX "IDX_distributors_name"`);
    await queryRunner.query(`DROP TABLE "distributors"`);
  }
}
