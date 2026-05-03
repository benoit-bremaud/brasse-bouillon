/**
 * Style-guideline editions tracked by the catalogue.
 *
 * **BJCP** = **Beer Judge Certification Program** — the international
 * non-profit (founded 1985, https://www.bjcp.org) that publishes the
 * de-facto reference for beer styles used worldwide by homebrewers,
 * craft brewers, and beer competitions. Each BJCP edition (1999, 2008,
 * 2015, 2021…) revises the style categories, numbering, and metric
 * ranges (OG / FG / IBU / SRM / ABV) as the brewing world evolves.
 *
 * The catalogue carries three values:
 *   - `BJCP_1999`: the legacy guide referenced by the BeerXML 1.0
 *     reference fixtures (libraries/style.xml). Kept verbatim for
 *     audit trail.
 *   - `BJCP_2021`: the current official guide brewers use today.
 *   - `HYBRID_POST_2010`: community styles that emerged after 2010
 *     and have no official BJCP category yet (e.g. White IPA).
 *
 * The set is intentionally closed (not an arbitrary string) so the
 * API can validate the `style_guide` filter and reject typos with a
 * 400 instead of silently returning `200 []`.
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
