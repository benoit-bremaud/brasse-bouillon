import React, { useCallback, useRef, useState } from "react";
import { Pressable, StyleSheet, Text } from "react-native";
import { useRouter } from "expo-router";

import { GlossaryPopup } from "@/core/ui/GlossaryPopup";
import { colors, typography } from "@/core/theme";
import { useGlossary } from "@/features/tools/application/use-glossary";
import type { GlossaryEntry } from "@/features/tools/domain/glossary.types";

interface Props {
  /** Canonical term or alias to resolve. Case-insensitive. */
  term: string;
  /** The visible label as it should be rendered in the source text. */
  children: string;
}

/**
 * Inline wrapper that turns a brewing term into an interactive
 * surface (Issue #783). On long-press, opens the `<GlossaryPopup>`
 * with the resolved entry. Regular taps are a no-op (graceful
 * degradation — the user discovers the long-press affordance via
 * the visual underline + auto-link in recipe descriptions).
 *
 * Long-press pattern reproduced from `ScanScreen` demo override:
 * a `useRef` guard suppresses the trailing `onPress` that React
 * Native fires immediately after `onLongPress`.
 *
 * If the term cannot be resolved (typo or unknown term), the
 * children are rendered as plain text — no popup, no underline.
 * This keeps the auto-linker safe even if the source text drifts.
 */
export function GlossaryTerm({ term, children }: Props) {
  const router = useRouter();
  const { getByTerm } = useGlossary();
  const longPressFiredRef = useRef(false);
  const [activeEntry, setActiveEntry] = useState<GlossaryEntry | null>(null);

  const resolved = getByTerm(term);

  const handleLongPress = useCallback(() => {
    if (!resolved) return;
    longPressFiredRef.current = true;
    setActiveEntry(resolved);
  }, [resolved]);

  const handlePress = useCallback(() => {
    if (longPressFiredRef.current) {
      longPressFiredRef.current = false;
      return;
    }
    // Regular tap is intentionally a no-op for now. Future: could
    // navigate directly to the Académie entry without going through
    // the popup, but the design choice for v0.1 keeps long-press as
    // the only entry point so users build the muscle memory.
  }, []);

  const handleClose = useCallback(() => {
    setActiveEntry(null);
  }, []);

  const handleReadMore = useCallback(() => {
    setActiveEntry(null);
    router.push("/(app)/academy/glossaire");
  }, [router]);

  // Unknown term — render as plain text, no interactive surface.
  if (!resolved) {
    return <Text>{children}</Text>;
  }

  return (
    <>
      <Pressable
        onLongPress={handleLongPress}
        onPress={handlePress}
        delayLongPress={500}
        accessibilityRole="button"
        accessibilityLabel={`Définition de ${resolved.displayLabel}`}
        accessibilityHint="Maintenir appuyé pour ouvrir la définition"
      >
        <Text style={styles.linkedTerm}>{children}</Text>
      </Pressable>
      <GlossaryPopup
        entry={activeEntry}
        onClose={handleClose}
        onReadMore={handleReadMore}
      />
    </>
  );
}

const styles = StyleSheet.create({
  linkedTerm: {
    color: colors.brand.secondary,
    textDecorationLine: "underline",
    fontSize: typography.size.body,
    lineHeight: typography.lineHeight.body,
  },
});
