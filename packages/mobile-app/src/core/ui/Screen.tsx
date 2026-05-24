import { colors, radius, spacing, typography } from "@/core/theme";
import {
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";

import { BeerMugLoader } from "@/core/ui/BeerMugLoader";
import { usePathname } from "expo-router";
import appBackground from "@/../assets/images/beer-gradient-background.png";

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
  const pathname = usePathname();
  // Don't add header padding on login/auth routes.
  const isAuth =
    pathname.startsWith("/login") ||
    pathname.startsWith("/register") ||
    pathname.includes("auth");
  const topPadding = isAuth ? spacing.md : 64; // clears the compact transparent brand header

  if (isLoading) {
    return (
      <ImageBackground
        source={appBackground}
        style={styles.background}
        resizeMode="cover"
      >
        <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
          <View
            style={[
              styles.container,
              styles.center,
              { paddingTop: topPadding },
            ]}
          >
            <BeerMugLoader size="large" />
          </View>
        </SafeAreaView>
      </ImageBackground>
    );
  }

  return (
    <ImageBackground
      source={appBackground}
      style={styles.background}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
        <View style={[styles.container, { paddingTop: topPadding }]}>
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
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    backgroundColor: "transparent",
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
    // Issue #641 — was `colors.semantic.error` (dark brown), now
    // aligned with the rest of the CTA stack which uses
    // `colors.brand.primary` (medium brown) — see PrimaryButton.
    marginTop: spacing.xs,
    alignSelf: "flex-start",
    backgroundColor: colors.brand.primary,
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
