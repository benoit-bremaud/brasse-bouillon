import React, { useMemo } from "react";
import { StyleProp, Text, TextStyle } from "react-native";

import { GlossaryTerm } from "@/core/ui/GlossaryTerm";
import { parseGlossaryTerms } from "@/core/text/glossary-auto-linker";
import { useGlossary } from "@/features/tools/application/use-glossary";
import { GLOSSARY_ENTRIES } from "@/features/tools/data/glossary.data";

interface Props {
  /** Plain text to scan for glossary terms. */
  text: string | null | undefined;
  /** Optional outer Text style (font size, color, etc. of the host context). */
  style?: StyleProp<TextStyle>;
}

/**
 * Renders plain text with brewing glossary terms automatically
 * wrapped in `<GlossaryTerm>` (Issue #783). Drop-in replacement
 * for `<Text>{description}</Text>` in any pedagogical context.
 *
 * The parser runs in `useMemo` keyed on the raw text so it only
 * re-tokenizes when the text changes — re-renders triggered by
 * unrelated state changes do not pay the parsing cost.
 *
 * Short-circuits to a plain `<Text>` when:
 * - the text is empty / null / undefined
 * - no glossary term matches
 *
 * If the glossary hook reports `isReady: false` (reserved for the
 * v0.2 API migration when fetch latency makes terms briefly
 * unavailable), the component falls back to rendering plain text.
 */
export function GlossaryText({ text, style }: Props) {
  const { isReady } = useGlossary();
  const safeText = text ?? "";

  const nodes = useMemo(() => {
    if (!isReady || safeText.length === 0) return [];
    return parseGlossaryTerms(safeText, GLOSSARY_ENTRIES);
  }, [safeText, isReady]);

  if (safeText.length === 0) {
    return null;
  }

  if (!isReady || nodes.length === 0 || allPlainText(nodes)) {
    return <Text style={style}>{safeText}</Text>;
  }

  return (
    <Text style={style}>
      {nodes.map((node, index) => {
        if (node.type === "term") {
          return (
            <GlossaryTerm
              key={`${index}-${node.entry.term}`}
              term={node.entry.term}
            >
              {node.value}
            </GlossaryTerm>
          );
        }
        return <Text key={`${index}-text`}>{node.value}</Text>;
      })}
    </Text>
  );
}

function allPlainText(nodes: ReturnType<typeof parseGlossaryTerms>): boolean {
  return nodes.every((node) => node.type === "text");
}
