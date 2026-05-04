import { useMemo } from "react";

import { GLOSSARY_ENTRIES } from "@/features/tools/data/glossary.data";
import type { GlossaryEntry } from "@/features/tools/domain/glossary.types";

/**
 * Stable signature for the brewing glossary hook (Issue #783).
 *
 * Designed to absorb the future v0.2 migration to a backend API
 * without breaking consumers — `isReady` exists today as a constant
 * `true` for the static implementation, and will flip during fetch
 * when the API version lands.
 */
export interface UseGlossaryReturn {
  /** Map keyed by canonical lowercase term ("mash"). */
  entries: ReadonlyMap<string, GlossaryEntry>;
  /**
   * Resolves a canonical term OR an alias to its entry. Lookup is
   * case-insensitive — callers don't have to lowercase upstream.
   */
  getByTerm: (term: string) => GlossaryEntry | undefined;
  /**
   * Pre-computed sorted list of every matchable surface (canonical
   * + aliases), ordered by descending length so the auto-linker
   * matches "dry hop" before "hop". All lowercase.
   */
  allMatchableTerms: ReadonlyArray<string>;
  /**
   * `true` once entries are available. Always `true` for the static
   * implementation; reserved in the signature for the v0.2 API
   * migration when fetch latency makes it briefly `false`.
   */
  isReady: boolean;
}

/**
 * Synchronous hook over the static glossary const. Uses `useMemo`
 * to build the lookup structures once per component lifetime — the
 * underlying `GLOSSARY_ENTRIES` array is module-level constant so
 * the memo cache is effectively process-wide.
 */
export function useGlossary(): UseGlossaryReturn {
  return useMemo(() => buildGlossaryReturn(GLOSSARY_ENTRIES), []);
}

/**
 * Pure builder factored out so unit tests can drive it with
 * arbitrary entry sets without going through React's hook runtime.
 */
export function buildGlossaryReturn(
  entries: ReadonlyArray<GlossaryEntry>,
): UseGlossaryReturn {
  const byTerm = new Map<string, GlossaryEntry>();
  const byAlias = new Map<string, GlossaryEntry>();
  const matchable = new Set<string>();

  for (const entry of entries) {
    const canonical = entry.term.toLowerCase();
    byTerm.set(canonical, entry);
    matchable.add(canonical);
    if (entry.aliases) {
      for (const alias of entry.aliases) {
        const normalized = alias.toLowerCase();
        byAlias.set(normalized, entry);
        matchable.add(normalized);
      }
    }
  }

  // Descending length so multi-word matches win over single-word
  // overlaps (e.g. "dry hop" before "hop").
  const allMatchableTerms = Array.from(matchable).sort(
    (left, right) => right.length - left.length,
  );

  return {
    entries: byTerm,
    getByTerm: (term: string) => {
      const normalized = term.toLowerCase();
      return byTerm.get(normalized) ?? byAlias.get(normalized);
    },
    allMatchableTerms,
    isReady: true,
  };
}
