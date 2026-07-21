import React, { useMemo } from "react";
import {
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import {
  brandHeader,
  radius,
  spacing,
  typography,
  useTheme,
} from "@/core/theme";
import type { ThemeColors } from "@/core/theme";
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
  const { colors: themeColors, resolvedMode } = useTheme();
  const styles = useMemo(() => createStyles(themeColors), [themeColors]);

  // Don't add header padding on login/auth routes.
  const isAuth =
    pathname.startsWith("/login") ||
    pathname.startsWith("/register") ||
    pathname.includes("auth");
  const contentStyle = isAuth
    ? styles.authContainer
    : styles.containerWithHeader;

  const content = isLoading ? (
    <View style={[styles.container, styles.center, contentStyle]}>
      <BeerMugLoader size="large" />
    </View>
  ) : (
    <View style={[styles.container, contentStyle]}>
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
  );

  if (resolvedMode === "dark") {
    return (
      <View style={styles.background}>
        <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
          {content}
        </SafeAreaView>
      </View>
    );
  }

  return (
    <ImageBackground
      source={appBackground}
      style={styles.background}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
        {content}
      </SafeAreaView>
    </ImageBackground>
  );
}

function createStyles(themeColors: ThemeColors) {
  return StyleSheet.create({
    background: {
      flex: 1,
      backgroundColor: themeColors.neutral.white,
    },
    safeArea: {
      flex: 1,
      backgroundColor: "transparent",
    },
    container: {
      flex: 1,
      padding: spacing.md,
    },
    authContainer: {
      paddingTop: spacing.md,
    },
    containerWithHeader: {
      paddingTop: brandHeader.contentClearance,
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
      borderColor: themeColors.semantic.error,
      backgroundColor: themeColors.state.errorBackground,
    },
    errorText: {
      color: themeColors.semantic.error,
      fontSize: typography.size.label,
      lineHeight: typography.lineHeight.label,
      fontWeight: typography.weight.medium,
    },
    retryButton: {
      marginTop: spacing.xs,
      alignSelf: "flex-start",
      backgroundColor: themeColors.brand.primary,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: radius.sm,
    },
    retryButtonText: {
      color: themeColors.neutral.white,
      fontWeight: typography.weight.medium,
      fontSize: typography.size.caption,
      lineHeight: typography.lineHeight.caption,
    },
  });
}
