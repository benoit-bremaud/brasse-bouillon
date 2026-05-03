/**
 * Domain shape for one producer entry in the immutable reference
 * catalogue. Mirrors the `ProducerOrmEntity` row shape one-to-one.
 *
 * **Producer ≠ Distributor**: a producer is the entity that
 * MAKES the product (1 product = 1 producer, brand owner). A
 * distributor is the entity that SELLS it to the brewer (1
 * product = N distributors). Distributors live in their own
 * table introduced by a follow-up PR (issue #901) and are the
 * actual foundation for the boutique 'Acheter' button. Keep the
 * two concerns separate at the schema level so the picker UI
 * surfaces brand identity through `producer_id` while the
 * boutique surfaces buy URLs through the `*_distributors` M:N.
 */

/**
 * Producer category — drives the picker UI grouping and tells
 * the consumer which catalogue tables are likely to reference
 * this producer.
 *   - laboratory             — yeast labs (Wyeast, White Labs, Fermentis…)
 *   - maltster               — malt manufacturers (Briess, Weyermann, Best Malz…)
 *   - hop_supplier           — hop houses (Yakima Chief, BarthHaas, Hopsteiner…)
 *   - equipment_manufacturer — brewing rig OEMs (Grainfather, Klarstein, Anvil…)
 *   - other                  — fallback (e.g. Lallemand straddles laboratory and finings)
 */
export enum ProducerType {
  Laboratory = 'laboratory',
  Maltster = 'maltster',
  HopSupplier = 'hop_supplier',
  EquipmentManufacturer = 'equipment_manufacturer',
  Other = 'other',
}

export interface ProducerEntry {
  id: string;
  name: string;
  type: ProducerType;
  /** ISO 3166-1 alpha-2 (uppercase ASCII), e.g. "US", "DE", "FR". */
  country: string | null;
  website: string | null;
  /** Brewer-friendly description in French (UI-facing). */
  notes: string | null;
  created_at: Date;
  updated_at: Date;
}
