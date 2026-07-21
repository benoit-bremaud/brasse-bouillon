import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors, radius, spacing, typography } from "@/core/theme";

type RouteErrorFallbackProps = {
  /** The error React caught while rendering the route subtree. */
  error: Error;
  /** Re-mounts the subtree, so a transient failure recovers without a restart. */
  retry: () => void;
};

/**
 * Visible fallback for a route subtree that threw while rendering.
 *
 * Release builds have no redbox: an uncaught render throw reaches the native
 * exception handler and kills the process, so the user just sees the app
 * vanish and we get no stack. Rendering on-device turns a silent crash into
 * something readable, and `retry` covers the transient case without forcing a
 * relaunch.
 *
 * Two audiences, hence two registers. The guidance is French and plain, like
 * the rest of the app — a brewer meeting this screen needs to know what to do,
 * not to parse `undefined is not a function`. The raw message is still shown,
 * but demoted below the action: dropping it would cost the diagnosability this
 * component exists for (a crash with no message is exactly what made the
 * 2026-07-20 incident take a day to pin down), while leading with it would hand
 * a novice an English stack fragment at the worst possible moment.
 */
export function RouteErrorFallback({ error, retry }: RouteErrorFallbackProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Une erreur est survenue</Text>
      <Text style={styles.message}>
        Cet écran n’a pas pu s’afficher. Réessaie — si le problème revient,
        transmets le détail ci-dessous.
      </Text>
      <Pressable
        accessibilityRole="button"
        onPress={retry}
        style={styles.retryButton}
      >
        <Text style={styles.retryLabel}>Réessayer</Text>
      </Pressable>
      {error.message ? (
        <Text style={styles.technicalDetail}>{error.message}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.brand.background,
    padding: spacing.lg,
    gap: spacing.md,
  },
  title: {
    fontSize: typography.size.h2,
    lineHeight: typography.lineHeight.h2,
    fontWeight: typography.weight.bold,
    color: colors.neutral.textPrimary,
    textAlign: "center",
  },
  message: {
    fontSize: typography.size.label,
    lineHeight: typography.lineHeight.label,
    color: colors.neutral.textSecondary,
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: colors.brand.primary,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  retryLabel: {
    fontSize: typography.size.body,
    lineHeight: typography.lineHeight.body,
    fontWeight: typography.weight.bold,
    color: colors.neutral.white,
  },
  technicalDetail: {
    fontSize: typography.size.caption,
    lineHeight: typography.lineHeight.caption,
    color: colors.neutral.muted,
    textAlign: "center",
  },
});
