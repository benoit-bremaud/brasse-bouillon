/**
 * Lower-cases and strips French diacritics (é→e, à→a, …) so text can be matched
 * accent-insensitively. Shared by the water provider (network-name matching) and
 * the water aggregation service (parameter-label → ion matching).
 */
export const normalizeFrenchLabel = (value: string): string =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();
