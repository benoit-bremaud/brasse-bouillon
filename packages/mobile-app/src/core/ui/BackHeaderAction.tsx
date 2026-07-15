import React from "react";

import type { Href } from "expo-router";

import { useBackNavigation } from "@/core/navigation/use-back-navigation";
import { HeaderBackButton } from "@/core/ui/HeaderBackButton";

type Props = {
  /** Route to land on when there is no navigation history to pop. */
  fallback: Href;
  /** Visible label; defaults to a generic "Retour". */
  label?: string;
};

/**
 * Ready-to-drop back control for a screen header (e.g. the `action` slot of
 * `ListHeader`). Wires {@link HeaderBackButton} to {@link useBackNavigation}
 * so every screen shares one back behavior: pop the real history, or fall
 * back to a known parent when there is none.
 */
export function BackHeaderAction({ fallback, label = "Retour" }: Props) {
  const goBack = useBackNavigation(fallback);

  return (
    <HeaderBackButton
      label={label}
      accessibilityLabel="Retour à l'écran précédent"
      onPress={goBack}
    />
  );
}
