import { useRouter, type Href } from "expo-router";
import React, { useMemo, useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";

import { useAuth } from "@/core/auth/auth-context";
import { getErrorMessage } from "@/core/http/http-error";
import { appInfo } from "@/core/config/app-info";
import { radius, spacing, typography, useTheme } from "@/core/theme";
import type { ThemeColors } from "@/core/theme";
import { Card } from "@/core/ui/Card";
import { Screen } from "@/core/ui/Screen";
import { ScreenScrollView } from "@/core/ui/ScreenScrollView";
import { getBrewerStats } from "@/features/profile/application/brewer-stats.use-cases";
import type { BrewerStats } from "@/features/profile/application/brewer-stats.use-cases";
import { Ionicons } from "@expo/vector-icons";

type ProfileRowProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  onPress: () => void;
};

function ProfileRow({ icon, label, value, onPress }: ProfileRowProps) {
  const { colors: themeColors } = useTheme();
  const styles = useMemo(() => createStyles(themeColors), [themeColors]);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <View style={styles.rowIcon}>
        <Ionicons name={icon} size={21} color={themeColors.brand.secondary} />
      </View>
      <View style={styles.rowCopy}>
        <Text style={styles.rowLabel}>{label}</Text>
        <Text style={styles.rowValue}>{value}</Text>
      </View>
      <Ionicons
        name="chevron-forward"
        size={20}
        color={themeColors.neutral.textSecondary}
      />
    </Pressable>
  );
}

function displayNameOf(
  firstName?: string,
  lastName?: string,
  username?: string,
) {
  return (
    [firstName, lastName].filter(Boolean).join(" ") || username || "Brasseur"
  );
}

function initialsOf(displayName: string) {
  return (
    displayName
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("") || "B"
  );
}

export function ProfileScreen() {
  const router = useRouter();
  const { session, logout, isLoading } = useAuth();
  const { colors: themeColors } = useTheme();
  const styles = useMemo(() => createStyles(themeColors), [themeColors]);
  const [isLogoutVisible, setIsLogoutVisible] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [stats, setStats] = useState<BrewerStats | null>(null);
  const [isStatsLoading, setIsStatsLoading] = useState(true);
  const displayName = displayNameOf(
    session?.user.firstName,
    session?.user.lastName,
    session?.user.username,
  );

  React.useEffect(() => {
    let isMounted = true;

    const loadStats = async () => {
      try {
        const nextStats = await getBrewerStats();
        if (isMounted) {
          setStats(nextStats);
        }
      } catch {
        // Stats are supplementary; the account hub remains usable if one of
        // the existing data sources is temporarily unavailable.
      } finally {
        if (isMounted) {
          setIsStatsLoading(false);
        }
      }
    };

    void loadStats();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleLogout = async () => {
    if (isLoggingOut) {
      return;
    }

    setErrorMessage(null);
    setIsLoggingOut(true);
    try {
      await logout();
    } catch (error) {
      setErrorMessage(getErrorMessage(error, "Impossible de se déconnecter"));
    } finally {
      setIsLoggingOut(false);
    }
  };

  const isLogoutPending = isLoading || isLoggingOut;

  return (
    <Screen>
      <ScreenScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.intro}>
          <Text style={styles.eyebrow}>ESPACE PERSONNEL</Text>
          <Text style={styles.title}>Mon profil</Text>
          <Text style={styles.subtitle}>
            Gère tes informations et les réglages de ton application.
          </Text>
        </View>

        <Card style={styles.identityCard}>
          <View style={styles.identityMain}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initialsOf(displayName)}</Text>
            </View>
            <View style={styles.identityCopy}>
              <Text style={styles.displayName}>{displayName}</Text>
              <Text style={styles.email}>{session?.user.email ?? "-"}</Text>
              <Text style={styles.username}>
                @{session?.user.username ?? "-"}
              </Text>
              {session?.user.bio ? (
                <Text style={styles.bio}>{session.user.bio}</Text>
              ) : null}
            </View>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Modifier mes informations personnelles"
            onPress={() => router.push("/(app)/profile/edit")}
            style={({ pressed }) => [
              styles.editButton,
              pressed && styles.pressed,
            ]}
          >
            <Ionicons
              name="create-outline"
              size={18}
              color={themeColors.brand.secondary}
            />
            <Text style={styles.editButtonText}>Modifier</Text>
          </Pressable>
        </Card>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mon parcours de brasseur</Text>
          <Card style={styles.statsCard}>
            {isStatsLoading ? (
              <Text style={styles.statsLoading}>
                Chargement de tes statistiques…
              </Text>
            ) : stats ? (
              <>
                <View style={styles.levelRow}>
                  <View style={styles.levelIcon}>
                    <Ionicons
                      name="trophy-outline"
                      size={22}
                      color={themeColors.brand.secondary}
                    />
                  </View>
                  <View style={styles.levelCopy}>
                    <Text style={styles.levelLabel}>Niveau actuel</Text>
                    <Text style={styles.levelValue}>{stats.level}</Text>
                  </View>
                </View>
                <View style={styles.statsGrid}>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>
                      {stats.completedBatches}
                    </Text>
                    <Text style={styles.statLabel}>Brassins terminés</Text>
                  </View>
                  <View style={styles.statDivider} />
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{stats.activeBatches}</Text>
                    <Text style={styles.statLabel}>En cours</Text>
                  </View>
                  <View style={styles.statDivider} />
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>
                      {stats.authoredRecipes}
                    </Text>
                    <Text style={styles.statLabel}>Recettes créées</Text>
                  </View>
                  <View style={styles.statDivider} />
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{stats.submittedScans}</Text>
                    <Text style={styles.statLabel}>Scans réalisés</Text>
                  </View>
                </View>
              </>
            ) : (
              <Text style={styles.statsUnavailable}>
                Tes statistiques seront disponibles dès que tes données seront
                synchronisées.
              </Text>
            )}
          </Card>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Compte et sécurité</Text>
          <Card style={styles.rowsCard}>
            <ProfileRow
              icon="person-outline"
              label="Informations personnelles"
              value="Nom, adresse e-mail et identifiant"
              onPress={() => router.push("/(app)/profile/edit")}
            />
            <View style={styles.separator} />
            <ProfileRow
              icon="lock-closed-outline"
              label="Mot de passe"
              value="Protège l'accès à ton compte"
              onPress={() => router.push("/(app)/profile/password")}
            />
          </Card>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Données</Text>
          <Card style={styles.rowsCard}>
            <ProfileRow
              icon="shield-checkmark-outline"
              label="Confidentialité et données"
              value="Préférences de conservation des scans"
              onPress={() => router.push("/(app)/profile/privacy")}
            />
            <View style={styles.separator} />
            <ProfileRow
              icon="trash-outline"
              label="Supprimer mon compte"
              value="Effacer mes données personnelles"
              onPress={() => router.push("/(app)/profile/delete" as Href)}
            />
            <View style={styles.separator} />
            <ProfileRow
              icon="download-outline"
              label="Exporter mes données"
              value="Demander une copie de mes informations"
              onPress={() => router.push("/(app)/profile/export" as Href)}
            />
          </Card>
        </View>

        {errorMessage ? (
          <Card style={styles.errorCard}>
            <Text style={styles.errorText}>{errorMessage}</Text>
          </Card>
        ) : null}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Session</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Se déconnecter"
            disabled={isLogoutPending}
            onPress={() => setIsLogoutVisible(true)}
            style={({ pressed }) => [
              styles.logoutButton,
              pressed && styles.pressed,
              isLogoutPending && styles.disabled,
            ]}
          >
            <Ionicons
              name="log-out-outline"
              size={20}
              color={themeColors.semantic.error}
            />
            <Text style={styles.logoutText}>Se déconnecter</Text>
          </Pressable>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Application</Text>
          <Card style={styles.rowsCard}>
            <ProfileRow
              icon="options-outline"
              label="Préférences de l'application"
              value="Thème, unités et notifications"
              onPress={() => router.push("/(app)/profile/preferences" as Href)}
            />
            <View style={styles.separator} />
            <ProfileRow
              icon="information-circle-outline"
              label="À propos de l'application"
              value={`Version ${appInfo.version}`}
              onPress={() => router.push("/(app)/profile/about")}
            />
          </Card>
        </View>
      </ScreenScrollView>

      <Modal
        transparent
        animationType="fade"
        visible={isLogoutVisible}
        onRequestClose={() => setIsLogoutVisible(false)}
      >
        <View style={styles.modalRoot}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Fermer la confirmation de déconnexion"
            onPress={() => setIsLogoutVisible(false)}
            style={styles.modalOverlay}
          />
          <Card style={styles.modalCard}>
            <Text style={styles.modalTitle}>Confirmer la déconnexion</Text>
            <Text style={styles.modalDescription}>
              Voulez-vous vraiment vous déconnecter de l'application ?
            </Text>
            <View style={styles.modalActions}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Annuler la déconnexion"
                disabled={isLogoutPending}
                onPress={() => setIsLogoutVisible(false)}
                style={({ pressed }) => [
                  styles.modalAction,
                  styles.cancelAction,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={styles.cancelText}>Annuler</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Confirmer la déconnexion"
                disabled={isLogoutPending}
                onPress={() => {
                  setIsLogoutVisible(false);
                  void handleLogout();
                }}
                style={({ pressed }) => [
                  styles.modalAction,
                  styles.confirmAction,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={styles.confirmText}>Se déconnecter</Text>
              </Pressable>
            </View>
          </Card>
        </View>
      </Modal>
    </Screen>
  );
}

function createStyles(themeColors: ThemeColors) {
  return StyleSheet.create({
    content: { gap: spacing.lg },
    intro: { gap: spacing.xxs },
    eyebrow: {
      color: themeColors.brand.secondary,
      fontSize: typography.size.caption,
      fontWeight: typography.weight.bold,
      letterSpacing: 1,
    },
    title: {
      color: themeColors.neutral.textPrimary,
      fontSize: typography.size.h1,
      lineHeight: typography.lineHeight.h1,
      fontWeight: typography.weight.bold,
    },
    subtitle: {
      color: themeColors.neutral.textSecondary,
      fontSize: typography.size.body,
      lineHeight: typography.lineHeight.body,
    },
    identityCard: { gap: spacing.sm },
    statsCard: { gap: spacing.md },
    statsLoading: {
      color: themeColors.neutral.textSecondary,
      fontSize: typography.size.label,
      lineHeight: typography.lineHeight.label,
    },
    statsUnavailable: {
      color: themeColors.neutral.textSecondary,
      fontSize: typography.size.caption,
      lineHeight: typography.lineHeight.caption,
    },
    levelRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
    levelIcon: {
      width: 44,
      height: 44,
      borderRadius: radius.full,
      backgroundColor: themeColors.brand.background,
      alignItems: "center",
      justifyContent: "center",
    },
    levelCopy: { flex: 1, gap: spacing.xxs },
    levelLabel: {
      color: themeColors.neutral.textSecondary,
      fontSize: typography.size.caption,
      lineHeight: typography.lineHeight.caption,
    },
    levelValue: {
      color: themeColors.brand.secondary,
      fontSize: typography.size.h2,
      lineHeight: typography.lineHeight.h2,
      fontWeight: typography.weight.bold,
    },
    statsGrid: {
      flexDirection: "row",
      alignItems: "stretch",
      borderTopWidth: 1,
      borderTopColor: themeColors.neutral.border,
      paddingTop: spacing.md,
    },
    statItem: { flex: 1, alignItems: "center", gap: spacing.xxs },
    statDivider: { width: 1, backgroundColor: themeColors.neutral.border },
    statValue: {
      color: themeColors.neutral.textPrimary,
      fontSize: typography.size.h2,
      lineHeight: typography.lineHeight.h2,
      fontWeight: typography.weight.bold,
    },
    statLabel: {
      color: themeColors.neutral.textSecondary,
      fontSize: typography.size.caption,
      lineHeight: typography.lineHeight.caption,
      textAlign: "center",
    },
    identityMain: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
    },
    avatar: {
      width: 68,
      height: 68,
      borderRadius: radius.full,
      backgroundColor: themeColors.brand.background,
      alignItems: "center",
      justifyContent: "center",
    },
    avatarText: {
      color: themeColors.brand.secondary,
      fontSize: typography.size.h2,
      fontWeight: typography.weight.bold,
    },
    identityCopy: { flex: 1, gap: spacing.xxs },
    displayName: {
      color: themeColors.neutral.textPrimary,
      fontSize: typography.size.h2,
      lineHeight: typography.lineHeight.h2,
      fontWeight: typography.weight.bold,
    },
    email: {
      color: themeColors.neutral.textSecondary,
      fontSize: typography.size.body,
      lineHeight: typography.lineHeight.body,
    },
    username: {
      color: themeColors.brand.secondary,
      fontSize: typography.size.caption,
      lineHeight: typography.lineHeight.caption,
    },
    bio: {
      color: themeColors.neutral.textSecondary,
      fontSize: typography.size.caption,
      lineHeight: typography.lineHeight.caption,
    },
    editButton: {
      minHeight: 44,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: spacing.xxs,
      borderWidth: 1,
      borderColor: themeColors.brand.secondary,
      borderRadius: radius.md,
    },
    editButtonText: {
      color: themeColors.brand.secondary,
      fontSize: typography.size.label,
      fontWeight: typography.weight.medium,
    },
    section: { gap: spacing.xs },
    sectionTitle: {
      color: themeColors.neutral.textPrimary,
      fontSize: typography.size.label,
      lineHeight: typography.lineHeight.label,
      fontWeight: typography.weight.bold,
    },
    rowsCard: { paddingVertical: 0 },
    row: {
      minHeight: 76,
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
    },
    rowIcon: {
      width: 40,
      height: 40,
      borderRadius: radius.full,
      backgroundColor: themeColors.brand.background,
      alignItems: "center",
      justifyContent: "center",
    },
    rowCopy: { flex: 1, gap: spacing.xxs },
    rowLabel: {
      color: themeColors.neutral.textPrimary,
      fontSize: typography.size.label,
      fontWeight: typography.weight.bold,
    },
    rowValue: {
      color: themeColors.neutral.textSecondary,
      fontSize: typography.size.caption,
    },
    separator: { height: 1, backgroundColor: themeColors.neutral.border },
    logoutButton: {
      minHeight: 52,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: spacing.xs,
      borderWidth: 1,
      borderColor: themeColors.semantic.error,
      backgroundColor: themeColors.state.errorBackground,
      borderRadius: radius.md,
    },
    logoutText: {
      color: themeColors.semantic.error,
      fontSize: typography.size.label,
      fontWeight: typography.weight.medium,
    },
    errorCard: {
      borderColor: themeColors.semantic.error,
      backgroundColor: themeColors.state.errorBackground,
    },
    errorText: {
      color: themeColors.semantic.error,
      fontSize: typography.size.caption,
      fontWeight: typography.weight.medium,
    },
    modalRoot: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: spacing.md,
    },
    modalOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: themeColors.neutral.black + "55",
    },
    modalCard: { width: "100%", maxWidth: 420, gap: spacing.sm },
    modalTitle: {
      color: themeColors.neutral.textPrimary,
      fontSize: typography.size.body,
      fontWeight: typography.weight.bold,
    },
    modalDescription: {
      color: themeColors.neutral.textSecondary,
      fontSize: typography.size.label,
      lineHeight: typography.lineHeight.label,
    },
    modalActions: { flexDirection: "row", gap: spacing.xs },
    modalAction: {
      flex: 1,
      minHeight: 48,
      borderRadius: radius.md,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
    },
    cancelAction: {
      borderColor: themeColors.neutral.border,
      backgroundColor: themeColors.neutral.white,
    },
    confirmAction: {
      borderColor: themeColors.semantic.error,
      backgroundColor: themeColors.state.errorBackground,
    },
    cancelText: {
      color: themeColors.neutral.textPrimary,
      fontSize: typography.size.label,
      fontWeight: typography.weight.medium,
    },
    confirmText: {
      color: themeColors.semantic.error,
      fontSize: typography.size.label,
      fontWeight: typography.weight.medium,
    },
    pressed: { opacity: 0.85 },
    disabled: { opacity: 0.5 },
  });
}
