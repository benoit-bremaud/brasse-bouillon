import React, { useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors, radius, spacing, typography } from "@/core/theme";

type CollapsibleProps = {
  title: string;
  /**
   * Lazy content factory. NOT a `children` prop on purpose: the
   * function is invoked exactly once — the first time the user
   * expands the fold — and the produced node is cached for the
   * lifetime of the component. Heavy work in the factory (a
   * `useQuery` started in the returned subtree, a Markdown parser,
   * a chart) therefore runs at most once per screen mount.
   *
   * This implements the GoF "Lazy Initialization" pattern called
   * out by issue #698: the content object is created on first
   * access, then memoised.
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
 * Once opened, the rendered ReactNode is cached in a ref so the
 * factory is invoked exactly once. Subsequent collapses only hide
 * the subtree via `display: none`; reopening reuses the same node.
 * Net effect: the lazy promise holds even across unrelated parent
 * re-renders.
 */
export function Collapsible({
  title,
  renderContent,
  initiallyExpanded = false,
  testID,
}: CollapsibleProps) {
  const [expanded, setExpanded] = useState<boolean>(initiallyExpanded);
  const [hasOpened, setHasOpened] = useState<boolean>(initiallyExpanded);
  const cachedContentRef = useRef<React.ReactNode>(null);

  // Initial mount when `initiallyExpanded` is true: produce the
  // cached node synchronously so it's available on the very first
  // render (matches the non-initially-expanded path which produces
  // the node inside the toggle handler).
  if (hasOpened && cachedContentRef.current === null) {
    cachedContentRef.current = renderContent();
  }

  const toggle = () => {
    if (!hasOpened) {
      cachedContentRef.current = renderContent();
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
          {cachedContentRef.current}
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
