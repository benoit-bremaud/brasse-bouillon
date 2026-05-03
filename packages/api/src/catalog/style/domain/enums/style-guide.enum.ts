/**
 * BJCP guideline editions and brewing-community style references
 * tracked by the catalogue. The set is intentionally closed (not
 * an arbitrary string) so the API can validate the `style_guide`
 * filter and reject typos with a 400 instead of silently returning
 * `200 []`.
 *
 * Adding a new guide (e.g. a future BJCP 2026 revision) is an
 * intentional, version-controlled act — extend this enum, ship a
 * migration that updates the CHECK constraint, and seed the new
 * entries.
 */
export enum StyleGuide {
  BJCP_1999 = 'BJCP 1999',
  BJCP_2021 = 'BJCP 2021',
  HYBRID_POST_2010 = 'Hybrid post-2010',
}
