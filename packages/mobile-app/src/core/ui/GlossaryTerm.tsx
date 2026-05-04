import React, { useCallback, useRef, useState } from "react";
import { StyleSheet, Text } from "react-native";
import { useRouter } from "expo-router";

import { GlossaryPopup } from "@/core/ui/GlossaryPopup";
import { colors } from "@/core/theme";
import { useGlossary } from "@/features/tools/application/use-glossary";
import type { GlossaryEntry } from "@/features/tools/domain/glossary.types";

interface Props {
  /** Canonical term or alias to resolve. Case-insensitive. */
  readonly term: string;
  /** The visible label as it should be rendered in the source text. */
  readonly children: string;
}

/**
 * Inline wrapper that turns a brewing term into an interactive
 * surface (Issue #783). Long-press opens the `<GlossaryPopup>`
 * (centered, backed by `react-native-modal`); regular tap is a
 * no-op.
 *
 * Implementation notes :
 * - `<Text onLongPress onPress>` directly (no Pressable-in-Text)
 *   so the term renders inline without breaking text flow
 * - Style only carries colour + underline; fontSize / weight are
 *   inherited from the parent paragraph
 * - `useRef` guard suppresses the trailing onPress RN fires after
 *   onLongPress (pattern from ScanScreen demo override)
 *
 * Unknown term → renders plain inherited Text (no popup, no
 * underline) — keeps the auto-linker safe even when the source
 * text drifts ahead of the glossary content.
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
    // Navigate first, close after — closing first unmounts the
    // Modal which on Android can cancel the in-flight tap and
    // drop the navigation call.
    router.push("/(app)/academy/glossaire");
    setActiveEntry(null);
  }, [router]);

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
        surface={children}
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
