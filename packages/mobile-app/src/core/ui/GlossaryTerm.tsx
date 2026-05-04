import React, { useCallback, useRef, useState } from "react";
import { StyleSheet, Text } from "react-native";
import { useRouter } from "expo-router";

import { GlossaryPopup } from "@/core/ui/GlossaryPopup";
import { colors } from "@/core/theme";
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
 * surface (Issue #783). Long-press opens the `<GlossaryPopup>`
 * with the resolved entry; regular tap is a no-op (graceful
 * degradation — the affordance is the visual underline only).
 *
 * Implementation note (Issue #783 visual fix on PR #913) :
 * the wrapper is a plain `<Text>` with React Native's native
 * `onLongPress` / `onPress` props — NOT a `<Pressable>` around a
 * `<Text>`. Pressable inside Text breaks inline flow (RN renders
 * it as a block-level View) and causes the glossary terms to
 * shift baseline relative to their surrounding paragraph.
 *
 * Likewise, the styled term carries ONLY the visual marks (color +
 * underline) — `fontSize` / `lineHeight` / `fontWeight` are
 * inherited from the parent `<Text>` so the term stays on the same
 * baseline as its host paragraph (label-size in RecipeDetailsScreen,
 * body-size in Académie body copy, etc.).
 *
 * Long-press pattern reproduced from `ScanScreen` demo override :
 * a `useRef` guard suppresses the trailing `onPress` RN fires
 * immediately after `onLongPress`.
 *
 * If the term cannot be resolved (typo or unknown term), children
 * render as plain inherited Text — no popup, no underline. Keeps
 * the auto-linker safe even when the source text drifts.
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
    // Regular tap is intentionally a no-op for v0.1.
  }, []);

  const handleClose = useCallback(() => {
    setActiveEntry(null);
  }, []);

  const handleReadMore = useCallback(() => {
    setActiveEntry(null);
    router.push("/(app)/academy/glossaire");
  }, [router]);

  // Unknown term — render plain text, no interactive surface, no
  // underline (inherits the parent paragraph style untouched).
  if (!resolved) {
    return <Text>{children}</Text>;
  }

  return (
    <>
      <Text
        style={styles.linkedTerm}
        onLongPress={handleLongPress}
        onPress={handlePress}
        accessibilityRole="button"
        accessibilityLabel={`Définition de ${resolved.displayLabel}`}
        accessibilityHint="Maintenir appuyé pour ouvrir la définition"
      >
        {children}
      </Text>
      <GlossaryPopup
        entry={activeEntry}
        onClose={handleClose}
        onReadMore={handleReadMore}
      />
    </>
  );
}

const styles = StyleSheet.create({
  // Visual marks ONLY — fontSize, lineHeight, fontWeight inherit
  // from the parent Text so the term stays on the host baseline.
  linkedTerm: {
    color: colors.brand.secondary,
    textDecorationLine: "underline",
  },
});
