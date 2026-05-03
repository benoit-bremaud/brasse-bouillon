/**
 * Domain shape for one misc template entry in the immutable
 * reference catalogue. Mirrors the `MiscTemplateOrmEntity` row
 * shape one-to-one (no field is computed) — kept as a separate
 * interface so the application / presentation layers do not
 * import the ORM entity directly.
 *
 * **Naming**: the table is called `misc_templates` (not `miscs`)
 * for two reasons. (1) Consistency with `equipment_templates` —
 * both catalogues share the convention "shared reference rows
 * the user can later copy into a personal recipe". (2) Avoid any
 * future collision with a recipe-side `recipe_misc` junction
 * table when the Recipe entities are refactored to point at this
 * catalogue (post Phase 3, normalize-producers PR).
 */

/**
 * BeerXML 1.0 `<MISC>` `TYPE` enum — the kind of miscellaneous
 * ingredient. Drives both the picker UI grouping and the
 * suggested USE / TIME defaults at recipe time.
 *   - spice        — dried seeds, peels, zests (Coriander, Orange Peel)
 *   - fining       — clarifier (Irish Moss, Whirlfloc, gelatin)
 *   - water_agent  — mineral / pH adjustment (CaCl₂, CaSO₄, lactic acid)
 *   - herb         — fresh plant parts or live roots (Ginger Root)
 *   - flavor       — extracts, vanilla beans, cocoa nibs
 *   - other        — yeast nutrient, lactose, BeerXML fallback
 */
export enum MiscType {
  Spice = 'spice',
  Fining = 'fining',
  WaterAgent = 'water_agent',
  Herb = 'herb',
  Flavor = 'flavor',
  Other = 'other',
}

/**
 * BeerXML 1.0 `<MISC>` `USE` enum — when the misc is added during
 * the brewing process. Stored as `use_at` rather than `use` to
 * avoid the SQL reserved keyword and match the domain wording the
 * Mobile UI uses ("ajout au moment de…").
 */
export enum MiscUseAt {
  Mash = 'mash',
  Boil = 'boil',
  Primary = 'primary',
  Secondary = 'secondary',
  Bottling = 'bottling',
}

export interface MiscTemplateEntry {
  id: string;
  name: string;
  type: MiscType;
  use_at: MiscUseAt;
  /**
   * Raw BeerXML AMOUNT value. Kilograms if `amount_is_weight`
   * is true, otherwise litres. Stored verbatim from BeerXML so
   * round-tripping a recipe through the catalogue preserves the
   * exact reference value.
   */
  amount: number;
  amount_is_weight: boolean;
  /** BeerXML TIME — minutes the misc spends in its USE phase. */
  time_min: number;
  /** BeerXML USE_FOR — short purpose category, English ("Clarity", "Belgian Wit"). */
  use_for: string | null;
  /** Brewer-friendly description, French (UI-facing). */
  notes: string | null;
  created_at: Date;
  updated_at: Date;
}
