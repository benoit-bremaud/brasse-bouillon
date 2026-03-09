import { colors, radius, shadows, spacing, typography } from "@/core/theme";
import React, { useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useAuth } from "@/core/auth/auth-context";
import { getErrorMessage } from "@/core/http/http-error";
import { Card } from "@/core/ui/Card";
import { Screen } from "@/core/ui/Screen";
import { Ionicons } from "@expo/vector-icons";

export function ProfileScreen() {
  const { session, refreshProfile, logout, isLoading } = useAuth();
  const [localError, setLocalError] = useState<string | null>(null);
  const [localInfo, setLocalInfo] = useState<string | null>(null);

  const displayName =
    session?.user.firstName || session?.user.username || "Brasseur";

  const handleRefreshProfile = async () => {
    setLocalError(null);
    setLocalInfo(null);
    try {
      await refreshProfile();
      setLocalInfo("Profil synchronisé avec le backend.");
    } catch (error) {
      setLocalError(
        getErrorMessage(error, "Impossible de rafraîchir le profil"),
      );
    }
  };

  const handleLogout = async () => {
    setLocalError(null);
    setLocalInfo(null);
    try {
      await logout();
    } catch (error) {
      setLocalError(getErrorMessage(error, "Impossible de se déconnecter"));
    }
  };

  const handleLogoutPress = () => {
    const canUseBrowserConfirm =
      typeof window !== "undefined" && typeof window.confirm === "function";

    if (canUseBrowserConfirm) {
      const confirmed = window.confirm(
        "Voulez-vous vraiment vous déconnecter de l'application ?",
      );

      if (confirmed) {
        void handleLogout();
      }

      return;
    }

    Alert.alert(
      "Confirmer la déconnexion",
      "Voulez-vous vraiment vous déconnecter de l'application ?",
      [
        {
          text: "Annuler",
          style: "cancel",
        },
        {
          text: "Se déconnecter",
          style: "destructive",
          onPress: () => {
            void handleLogout();
          },
        },
      ],
    );
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content}>
        <Card style={styles.headerCard}>
          <View style={styles.avatar}>
            <Ionicons
              name="person-circle-outline"
              size={44}
              color={colors.brand.secondary}
            />
          </View>
          <Text style={styles.title}>Profil</Text>
          <Text style={styles.subtitle}>{displayName}</Text>
        </Card>

        <Card>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Email</Text>
            <Text style={styles.value}>{session?.user.email ?? "-"}</Text>
          </View>

          <View style={styles.separator} />

          <View style={styles.infoRow}>
            <Text style={styles.label}>Username</Text>
            <Text style={styles.value}>{session?.user.username ?? "-"}</Text>
          </View>

          <View style={styles.separator} />

          <View style={styles.infoRow}>
            <Text style={styles.label}>Role</Text>
            <Text style={styles.value}>{session?.user.role ?? "-"}</Text>
          </View>
        </Card>

        {localInfo ? <Text style={styles.info}>{localInfo}</Text> : null}
        {localError ? <Text style={styles.error}>{localError}</Text> : null}

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Rafraîchir le profil"
          onPress={handleRefreshProfile}
          disabled={isLoading}
          style={({ pressed }) => [
            styles.primaryAction,
            pressed && styles.pressed,
            isLoading && styles.disabled,
          ]}
        >
          <Text style={styles.primaryActionText}>Rafraîchir le profil</Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Se déconnecter"
          onPress={handleLogoutPress}
          disabled={isLoading}
          style={({ pressed }) => [
            styles.secondaryAction,
            pressed && styles.pressed,
            isLoading && styles.disabled,
          ]}
        >
          <Text style={styles.secondaryActionText}>Se déconnecter</Text>
        </Pressable>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.sm,
    paddingBottom: spacing.lg,
  },
  headerCard: {
    alignItems: "center",
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: radius.full,
    backgroundColor: colors.brand.background,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.xs,
  },
  title: {
    fontSize: typography.size.h2,
    lineHeight: typography.lineHeight.h2,
    fontWeight: typography.weight.bold,
    color: colors.neutral.textPrimary,
  },
  subtitle: {
    fontSize: typography.size.label,
    lineHeight: typography.lineHeight.label,
    color: colors.neutral.textSecondary,
    fontWeight: typography.weight.medium,
  },
  infoRow: {
    gap: spacing.xxs,
  },
  label: {
    fontSize: typography.size.caption,
    lineHeight: typography.lineHeight.caption,
    color: colors.neutral.textSecondary,
    fontWeight: typography.weight.medium,
  },
  value: {
    fontSize: typography.size.body,
    lineHeight: typography.lineHeight.body,
    color: colors.neutral.textPrimary,
    fontWeight: typography.weight.regular,
  },
  separator: {
    height: 1,
    backgroundColor: colors.neutral.border,
    marginVertical: spacing.sm,
  },
  primaryAction: {
    backgroundColor: colors.brand.primary,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.sm,
    ...shadows.sm,
  },
  primaryActionText: {
    color: colors.neutral.white,
    fontSize: typography.size.label,
    lineHeight: typography.lineHeight.label,
    fontWeight: typography.weight.medium,
  },
  secondaryAction: {
    borderWidth: 1,
    borderColor: colors.semantic.error,
    backgroundColor: colors.state.errorBackground,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.sm,
  },
  secondaryActionText: {
    color: colors.semantic.error,
    fontSize: typography.size.label,
    lineHeight: typography.lineHeight.label,
    fontWeight: typography.weight.medium,
  },
  info: {
    color: colors.semantic.success,
    fontSize: typography.size.caption,
    lineHeight: typography.lineHeight.caption,
    fontWeight: typography.weight.medium,
  },
  error: {
    color: colors.semantic.error,
    fontSize: typography.size.caption,
    lineHeight: typography.lineHeight.caption,
    fontWeight: typography.weight.medium,
  },
  pressed: {
    opacity: 0.85,
  },
  disabled: {
    opacity: 0.5,
  },
});
