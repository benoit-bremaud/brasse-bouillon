import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import React from "react";

import { colors, spacing, typography } from "@/core/theme";
import { PrimaryButton } from "@/core/ui/PrimaryButton";

import {
  END_OF_LIST,
  NEXT_PAGE_ERROR,
  RETRY_LABEL,
} from "@/features/beer-catalog/presentation/beer-catalog.constants";

type Props = {
  isFetchingNextPage: boolean;
  /**
   * TanStack v5 `isFetchNextPageError` — a `fetchNextPage` failure
   * specifically (NOT a refetch error): the list above stays visible and
   * the retry is inline, per `mobile-catalog/05-sequence-errors.md`.
   */
  isFetchNextPageError: boolean;
  hasNextPage: boolean;
  itemCount: number;
  onRetry: () => void;
};

/** Infinite-list footer: next-page spinner / inline error / end of list. */
export function CatalogListFooter({
  isFetchingNextPage,
  isFetchNextPageError,
  hasNextPage,
  itemCount,
  onRetry,
}: Props) {
  if (isFetchingNextPage) {
    return (
      <View style={styles.container} testID="catalog-footer-loading">
        <ActivityIndicator color={colors.brand.primary} />
      </View>
    );
  }

  if (isFetchNextPageError) {
    return (
      <View style={styles.container} testID="catalog-footer-error">
        <Text style={styles.errorText}>{NEXT_PAGE_ERROR}</Text>
        <PrimaryButton label={RETRY_LABEL} onPress={onRetry} />
      </View>
    );
  }

  if (!hasNextPage && itemCount > 0) {
    return (
      <View style={styles.container} testID="catalog-footer-end">
        <Text style={styles.endText}>{END_OF_LIST}</Text>
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.md,
    alignItems: "center",
    gap: spacing.xs,
  },
  errorText: {
    color: colors.semantic.error,
    fontSize: typography.size.label,
    lineHeight: typography.lineHeight.label,
  },
  endText: {
    color: colors.neutral.muted,
    fontSize: typography.size.caption,
    lineHeight: typography.lineHeight.caption,
  },
});
