import React, { useCallback, useRef, useState } from "react";
import { GestureResponderEvent, StyleSheet, Text } from "react-native";
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

interface ActiveTrigger {
  readonly entry: GlossaryEntry;
  /**
   * Vertical position of the long-press in window coordinates.
   * Optional because synthetic test press events do not carry a
   * native event payload — undefined falls back to vertical
   * centering at the popup level.
   */
  readonly anchorY: number | undefined;
}

/**
 * Inline wrapper that turns a brewing term into an interactive
 * surface (Issue #783). Long-press opens the `<GlossaryPopup>`
 * anchored just below the finger position; regular tap is a no-op.
 *
 * Captures `pageY` from the press event so the popup appears next
 * to the term the user just pressed — feels like a contextual
 * tooltip rather than a centered modal.
 *
 * Implementation note (PR #913 visual fixes) :
 * - Plain `<Text onLongPress onPress>` (no Pressable-in-Text)
 * - Style only carries colour + underline so font size / weight
 *   inherit from the parent paragraph
 * - `useRef` guard suppresses the trailing onPress RN fires after
 *   onLongPress (pattern from ScanScreen demo override)
 *
 * Unknown term → renders plain inherited Text (no popup, no
 * underline). Keeps the auto-linker safe even if the source text
 * drifts ahead of the glossary content.
 */
export function GlossaryTerm({ term, children }: Props) {
  const router = useRouter();
  const { getByTerm } = useGlossary();
  const longPressFiredRef = useRef(false);
  const [trigger, setTrigger] = useState<ActiveTrigger | null>(null);

  const resolved = getByTerm(term);

  const handleLongPress = useCallback(
    (event: GestureResponderEvent) => {
      if (!resolved) return;
      longPressFiredRef.current = true;
      // `event` may be missing in synthetic test press events —
      // fall back to undefined anchor (popup centers vertically).
      const anchorY = event?.nativeEvent?.pageY;
      setTrigger({ entry: resolved, anchorY });
    },
    [resolved],
  );

  const handlePress = useCallback(() => {
    if (longPressFiredRef.current) {
      longPressFiredRef.current = false;
      return;
    }
    // Regular tap is intentionally a no-op for v0.1.
  }, []);

  const handleClose = useCallback(() => {
    setTrigger(null);
  }, []);

  const handleReadMore = useCallback(() => {
    // Navigate first, close after — closing first unmounts the
    // Modal which on Android can cancel the in-flight touch and
    // drop the navigation call.
    router.push("/(app)/academy/glossaire");
    setTrigger(null);
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
        entry={trigger?.entry ?? null}
        anchorY={trigger?.anchorY}
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
