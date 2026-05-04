import type { GlossaryEntry } from "@/features/tools/domain/glossary.types";

/**
 * Output of the auto-linker — a flat tree of `text` and `term`
 * nodes that the renderer (`<GlossaryText>`) maps to React Native
 * components. Pure data, no React, no JSX.
 */
export type RichTextNode =
  | { type: "text"; value: string }
  | {
      type: "term";
      /** The original surface as it appeared in the source text (preserves casing). */
      value: string;
      /** The glossary entry the surface resolves to. */
      entry: GlossaryEntry;
    };

/**
 * Parses `text` into a flat array of text/term nodes by detecting
 * occurrences of any glossary entry's canonical term or alias.
 * Matching is case-insensitive but preserves the original casing
 * inside the term node so the renderer can keep the source typing.
 *
 * Term ordering by descending surface length ensures multi-word
 * matches win over their single-word substrings (e.g. `dry hop`
 * beats `hop`). Word-boundary detection uses Unicode-aware lookups
 * via per-character class checks so accented surfaces (`empâtage`)
 * match correctly — JavaScript's plain `\b` does not handle
 * Unicode letters by default.
 *
 * Edge cases (validated by tests):
 * - empty `text` → `[]`
 * - no match → `[{type: 'text', value: text}]`
 * - match at start / middle / end of string
 * - multiple matches of the same term
 * - match across alias (`empâtage` → resolves to `mash` entry)
 * - mixed case (`Mash`, `MASH` both match)
 */
export function parseGlossaryTerms(
  text: string,
  entries: ReadonlyArray<GlossaryEntry>,
): RichTextNode[] {
  if (text.length === 0) {
    return [];
  }
  if (entries.length === 0) {
    return [{ type: "text", value: text }];
  }

  // Build the matchable-surface → entry index, sorted by descending
  // length so the longest surface is tried first at each position.
  const surfaceToEntry = new Map<string, GlossaryEntry>();
  for (const entry of entries) {
    surfaceToEntry.set(entry.term.toLowerCase(), entry);
    if (entry.aliases) {
      for (const alias of entry.aliases) {
        surfaceToEntry.set(alias.toLowerCase(), entry);
      }
    }
  }
  const surfacesDesc = Array.from(surfaceToEntry.keys()).sort(
    (left, right) => right.length - left.length,
  );

  const lower = text.toLowerCase();
  const nodes: RichTextNode[] = [];
  let cursor = 0;

  while (cursor < text.length) {
    const matched = findMatchAt(lower, cursor, surfacesDesc);

    if (matched === null) {
      cursor += 1;
      continue;
    }

    // Flush any plain text accumulated since the last term.
    if (matched.start > flushedUpTo(nodes)) {
      nodes.push({
        type: "text",
        value: text.slice(flushedUpTo(nodes), matched.start),
      });
    }

    const surface = text.slice(matched.start, matched.end);
    const entry = surfaceToEntry.get(matched.surfaceKey);
    if (entry) {
      nodes.push({ type: "term", value: surface, entry });
    } else {
      // Defensive — should never happen because we built the index
      // from the same surfaces we're iterating.
      nodes.push({ type: "text", value: surface });
    }
    cursor = matched.end;
  }

  // Flush trailing plain text.
  const tail = flushedUpTo(nodes);
  if (tail < text.length) {
    nodes.push({ type: "text", value: text.slice(tail) });
  }

  return nodes;
}

/**
 * Finds the first matching surface at exactly `position` in the
 * lowercased text. Returns the matched surface key + the original
 * text bounds, or `null` if no surface matches at this position OR
 * if the match is not on a word boundary.
 */
function findMatchAt(
  lowerText: string,
  position: number,
  surfacesDesc: ReadonlyArray<string>,
): { surfaceKey: string; start: number; end: number } | null {
  for (const surface of surfacesDesc) {
    if (
      lowerText.startsWith(surface, position) &&
      isWordBoundary(lowerText, position, position + surface.length)
    ) {
      return {
        surfaceKey: surface,
        start: position,
        end: position + surface.length,
      };
    }
  }
  return null;
}

/**
 * True if both ends of the [start, end) slice are at a word
 * boundary — i.e. the character outside the slice is either
 * absent (string boundary) or a non-letter/non-digit character.
 * Unicode-aware to handle accented French (`empâtage`), unlike
 * regex `\b`.
 */
function isWordBoundary(text: string, start: number, end: number): boolean {
  const before = start > 0 ? text[start - 1] : "";
  const after = end < text.length ? text[end] : "";
  return !isWordChar(before) && !isWordChar(after);
}

const WORD_CHAR_RE = /\p{L}|\p{N}/u;

function isWordChar(char: string): boolean {
  return char.length > 0 && WORD_CHAR_RE.test(char);
}

/**
 * Returns the offset up to which the node array has consumed the
 * source text. Used to flush plain-text gaps between matches.
 */
function flushedUpTo(nodes: ReadonlyArray<RichTextNode>): number {
  let consumed = 0;
  for (const node of nodes) {
    consumed += node.value.length;
  }
  return consumed;
}
