import { useEffect, useState } from "react";

export const SEARCH_DEBOUNCE_MS = 300;

/**
 * Returns `value` after it has stopped changing for `delayMs`. Rapid
 * keystrokes reset the timer so only the settled value propagates —
 * the debounce of the search-input state machine
 * (`mobile-catalog/08-state-search-input.md`).
 */
export function useDebouncedValue<T>(
  value: T,
  delayMs = SEARCH_DEBOUNCE_MS,
): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const handle = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(handle);
  }, [value, delayMs]);

  return debounced;
}
