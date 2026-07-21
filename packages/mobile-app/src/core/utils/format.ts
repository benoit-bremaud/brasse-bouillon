/**
 * Shared, layer-neutral formatting helpers (importable from any layer).
 */

/**
 * Format a quantity for display: an integer stays integer, a fractional value
 * is rounded to two decimals, then suffixed with its unit (e.g. "0.9 kg",
 * "5 g"). A non-finite amount degrades to "0 <unit>".
 */
export function formatQuantity(amount: number, unit: string): string {
  if (!Number.isFinite(amount)) {
    return `0 ${unit}`;
  }

  const roundedAmount = Number.isInteger(amount)
    ? amount
    : Number.parseFloat(amount.toFixed(2));

  return `${roundedAmount} ${unit}`;
}

/**
 * Format an ISO date string for display in French ("12 juillet 2026").
 *
 * Returns `null` for a missing or unparseable value so callers can omit the
 * line entirely rather than render "Invalid Date" — a recipe or batch whose
 * `createdAt` never arrived should show no date, not a broken one.
 */
export function formatFrDate(iso: string | null | undefined): string | null {
  if (!iso) {
    return null;
  }

  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}
