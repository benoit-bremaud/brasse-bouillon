/**
 * Domain types for the brewing glossary (Issue #783).
 *
 * The glossary is editorial reference content bundled client-side
 * with the mobile app. The static data layer (`data/glossary.data.ts`)
 * exports a `ReadonlyArray<GlossaryEntry>` consumed by the
 * `useGlossary()` hook.
 *
 * v0.2 migration to a backend API is captured in a follow-up issue;
 * the `GlossaryEntry` shape is identical between static and API
 * implementations so the migration touches only the data layer.
 */

export type GlossaryCategory =
  | "brewing-process"
  | "measurement"
  | "equipment"
  | "ingredient"
  | "style";

export interface GlossaryEntry {
  /** Canonical lowercase slug used as the entries map key ("mash"). */
  term: string;
  /** UI label, capitalized for display ("Mash"). */
  displayLabel: string;
  /** 1-2 sentence French definition surfaced in the popup. */
  definition: string;
  /** Drives the badge variant + colour in the popup. */
  category: GlossaryCategory;
  /**
   * Lowercase variants the auto-linker should also detect
   * (e.g. `mash` → `["empâtage", "mashing"]`). Keeps the canonical
   * term singular while UI text can use plurals or French/English
   * synonyms transparently.
   */
  aliases?: ReadonlyArray<string>;
}
