import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors, radius, spacing, typography } from "@/core/theme";

type CollapsibleProps = {
  title: string;
  /**
   * Lazy content factory. NOT a `children` prop on purpose: the
   * function is only called the first time the user expands the
   * fold, so any heavy work (eg. a `useQuery` started in the
   * returned subtree, a Markdown parser, a chart) is deferred to
   * the user's actual intent.
   *
   * This implements the GoF "Lazy Initialization" pattern called
   * out by issue #698: the content object is created on first
   * access, not at parent render time.
   */
  renderContent: () => React.ReactNode;
  initiallyExpanded?: boolean;
  testID?: string;
};

/**
 * A disclosure widget with a title row + chevron and lazily rendered
 * content. First render of the screen does NOT mount the content
 * subtree — that only happens after the user opens the fold once.
 *
 * Once opened, the content stays mounted (subsequent collapse only
 * hides it via `display: none` so reopening is instant). This is a
 * deliberate tradeoff: a tiny memory cost in exchange for
 * preserving any state the content might have accumulated (scroll
 * position, fetched data, form input).
 */
export function Collapsible({
  title,
  renderContent,
  initiallyExpanded = false,
  testID,
}: CollapsibleProps) {
  const [expanded, setExpanded] = useState<boolean>(initiallyExpanded);
  const [hasOpened, setHasOpened] = useState<boolean>(initiallyExpanded);

  const toggle = () => {
    if (!hasOpened) {
      setHasOpened(true);
    }
    setExpanded((prev) => !prev);
  };

  return (
    <View style={styles.wrapper} testID={testID}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded }}
        accessibilityLabel={title}
        onPress={toggle}
        style={({ pressed }) => [
          styles.header,
          pressed ? styles.headerPressed : null,
        ]}
      >
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.chevron} importantForAccessibility="no">
          {expanded ? "▾" : "▸"}
        </Text>
      </Pressable>
      {hasOpened ? (
        <View style={[styles.content, expanded ? null : styles.hidden]}>
          {renderContent()}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: colors.neutral.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    marginBottom: spacing.sm,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  headerPressed: {
    opacity: 0.85,
  },
  title: {
    flex: 1,
    fontSize: typography.size.label,
    fontWeight: typography.weight.medium,
    color: colors.neutral.textPrimary,
  },
  chevron: {
    fontSize: typography.size.body,
    color: colors.brand.primary,
    marginLeft: spacing.sm,
  },
  content: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    paddingTop: spacing.xs,
  },
  hidden: {
    display: "none",
  },
});
