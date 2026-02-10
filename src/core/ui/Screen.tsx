import { colors, radius, spacing, typography } from "@/core/theme";
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import React from "react";

type ScreenProps = {
  children: React.ReactNode;
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
};

export function Screen({
  children,
  isLoading = false,
  error = null,
  onRetry,
}: ScreenProps) {
  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={[styles.container, styles.center]}>
          <ActivityIndicator color={colors.brand.secondary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {error ? (
          <View style={styles.errorCard}>
            <Text style={styles.errorText}>{error}</Text>
            {onRetry ? (
              <Pressable onPress={onRetry} style={styles.retryButton}>
                <Text style={styles.retryButtonText}>Réessayer</Text>
              </Pressable>
            ) : null}
          </View>
        ) : null}
        {children}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.brand.background,
  },
  container: {
    flex: 1,
    padding: spacing.md,
  },
  center: {
    alignItems: "center",
    justifyContent: "center",
  },
  errorCard: {
    marginBottom: spacing.sm,
    padding: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.semantic.error,
    backgroundColor: colors.state.errorBackground,
  },
  errorText: {
    color: colors.semantic.error,
    fontSize: typography.size.label,
    lineHeight: typography.lineHeight.label,
    fontWeight: typography.weight.medium,
  },
  retryButton: {
    marginTop: spacing.xs,
    alignSelf: "flex-start",
    backgroundColor: colors.semantic.error,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
  },
  retryButtonText: {
    color: colors.neutral.white,
    fontWeight: typography.weight.medium,
    fontSize: typography.size.caption,
    lineHeight: typography.lineHeight.caption,
  },
});
