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
