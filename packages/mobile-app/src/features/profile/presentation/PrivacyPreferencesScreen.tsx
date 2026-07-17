import { useRouter, type Href } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";

import { getErrorMessage } from "@/core/http/http-error";
import { radius, spacing, typography, useTheme } from "@/core/theme";
import type { ThemeColors } from "@/core/theme";
import { HeaderBackButton } from "@/core/ui/HeaderBackButton";
import { PrimaryButton } from "@/core/ui/PrimaryButton";
import { Screen } from "@/core/ui/Screen";
import { ScreenScrollView } from "@/core/ui/ScreenScrollView";
import {
  getDefaultPrivacyPreferences,
  getPrivacySettings,
  savePrivacySettings,
} from "@/features/profile/application/privacy-preferences.use-cases";
import type { PrivacyPreferences } from "@/features/profile/application/privacy-preferences.use-cases";
import { Ionicons } from "@expo/vector-icons";

type PreferenceKey = keyof PrivacyPreferences;

type PreferenceRowProps = {
  label: string;
  description: string;
  value: boolean;
  disabled?: boolean;
  onValueChange: (value: boolean) => void;
};

function PreferenceRow({
  label,
  description,
  value,
  disabled = false,
  onValueChange,
}: PreferenceRowProps) {
  const { colors: themeColors } = useTheme();
  const styles = useMemo(() => createStyles(themeColors), [themeColors]);

  return (
    <View style={styles.preferenceRow}>
      <View style={styles.preferenceCopy}>
        <Text style={styles.preferenceLabel}>{label}</Text>
        <Text style={styles.preferenceDescription}>{description}</Text>
      </View>
      <Switch
        accessibilityLabel={label}
        disabled={disabled}
        ios_backgroundColor={themeColors.neutral.border}
        onValueChange={onValueChange}
        thumbColor={
          value ? themeColors.neutral.white : themeColors.neutral.muted
        }
        trackColor={{
          false: themeColors.neutral.border,
          true: themeColors.semantic.success,
        }}
        value={value}
      />
    </View>
  );
}

export function PrivacyPreferencesScreen() {
  const router = useRouter();
  const { colors: themeColors } = useTheme();
  const styles = useMemo(() => createStyles(themeColors), [themeColors]);
  const [preferences, setPreferences] = useState<PrivacyPreferences>(() =>
    getDefaultPrivacyPreferences(),
  );
  const [retentionDays, setRetentionDays] = useState(30);
  const [hasConsent, setHasConsent] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadSettings = async () => {
      try {
        const settings = await getPrivacySettings();
        if (!isMounted || !settings) {
          return;
        }

        setPreferences(settings.preferences);
        setRetentionDays(settings.retentionDays);
        setHasConsent(settings.hasConsent);
      } catch (error) {
        if (isMounted) {
          setErrorMessage(
            getErrorMessage(
              error,
              "Impossible de charger tes préférences de confidentialité.",
            ),
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadSettings();
    return () => {
      isMounted = false;
    };
  }, []);

  const updatePreference = (key: PreferenceKey, value: boolean) => {
    setPreferences((current) => ({ ...current, [key]: value }));
  };

  const handleSave = async () => {
    if (isSaving) {
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);

    try {
      const settings = await savePrivacySettings({
        retentionDays,
        preferences,
      });
      setHasConsent(settings.hasConsent);
    } catch (error) {
      setErrorMessage(
        getErrorMessage(
          error,
          "Impossible d'enregistrer tes préférences de confidentialité.",
        ),
      );
      return;
    } finally {
      setIsSaving(false);
    }

    router.back();
  };

  return (
    <Screen>
      <ScreenScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <HeaderBackButton
          accessibilityLabel="Retour au profil"
          label="Profil"
          onPress={() => router.back()}
        />

        <View style={styles.intro}>
          <Text style={styles.eyebrow}>DONNÉES PERSONNELLES</Text>
          <Text style={styles.title}>Confidentialité et données</Text>
          <Text style={styles.subtitle}>
            Choisis ce que Brasse Bouillon peut conserver lorsque tu utilises le
            scanner.
          </Text>
        </View>

        {isLoading ? (
          <View style={styles.loadingState}>
            <ActivityIndicator color={themeColors.brand.secondary} />
            <Text style={styles.loadingText}>Chargement des préférences…</Text>
          </View>
        ) : (
          <View style={styles.form}>
            <View style={styles.status}>
              <Text style={styles.statusLabel}>État du consentement</Text>
              <Text style={styles.statusValue}>
                {hasConsent ? "Préférences enregistrées" : "À configurer"}
              </Text>
            </View>

            <View style={styles.preferenceList}>
              <PreferenceRow
                description="Permet de retrouver une bière scannée plus facilement."
                disabled={isSaving}
                label="Conserver les codes-barres"
                onValueChange={(value) =>
                  updatePreference("storeBarcodeValue", value)
                }
                value={preferences.storeBarcodeValue}
              />
              <View style={styles.separator} />
              <PreferenceRow
                description="Conserve les images utilisées pendant une identification."
                disabled={isSaving}
                label="Conserver les photos de bouteille"
                onValueChange={(value) =>
                  updatePreference("storeBottlePhotos", value)
                }
                value={preferences.storeBottlePhotos}
              />
              <View style={styles.separator} />
              <PreferenceRow
                description="Conserve la date et les informations techniques du scan."
                disabled={isSaving}
                label="Conserver les métadonnées de scan"
                onValueChange={(value) =>
                  updatePreference("storeScanMetadata", value)
                }
                value={preferences.storeScanMetadata}
              />
              <View style={styles.separator} />
              <PreferenceRow
                description="Autorise l'utilisation des données consenties pour améliorer les modèles."
                disabled={isSaving}
                label="Améliorer les modèles"
                onValueChange={(value) =>
                  updatePreference("useDataForModelTraining", value)
                }
                value={preferences.useDataForModelTraining}
              />
            </View>

            <Text style={styles.retentionText}>
              Les données de scan sont conservées pendant {retentionDays} jours
              au maximum.
            </Text>

            {errorMessage ? (
              <Text style={styles.error}>{errorMessage}</Text>
            ) : null}

            <PrimaryButton
              accessibilityLabel="Enregistrer mes préférences de confidentialité"
              disabled={isSaving}
              label={isSaving ? "Enregistrement…" : "Enregistrer"}
              onPress={() => void handleSave()}
            />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Voir l'historique des décisions"
              onPress={() =>
                router.push("/(app)/profile/privacy-history" as Href)
              }
              style={({ pressed }) => [
                styles.historyLink,
                pressed && styles.historyLinkPressed,
              ]}
            >
              <Text style={styles.historyLinkText}>
                Voir l'historique des décisions
              </Text>
              <Ionicons
                name="chevron-forward"
                size={18}
                color={themeColors.brand.secondary}
              />
            </Pressable>
          </View>
        )}
      </ScreenScrollView>
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
    loadingState: {
      minHeight: 180,
      alignItems: "center",
      justifyContent: "center",
      gap: spacing.sm,
    },
    loadingText: {
      color: themeColors.neutral.textSecondary,
      fontSize: typography.size.label,
    },
    form: { gap: spacing.md },
    status: {
      gap: spacing.xxs,
      padding: spacing.sm,
      borderRadius: radius.md,
      backgroundColor: themeColors.state.infoBackground,
      borderWidth: 1,
      borderColor: themeColors.neutral.border,
    },
    statusLabel: {
      color: themeColors.neutral.textSecondary,
      fontSize: typography.size.caption,
    },
    statusValue: {
      color: themeColors.neutral.textPrimary,
      fontSize: typography.size.label,
      fontWeight: typography.weight.bold,
    },
    preferenceList: {
      paddingHorizontal: spacing.sm,
      borderRadius: radius.md,
      backgroundColor: themeColors.neutral.white,
      borderWidth: 1,
      borderColor: themeColors.neutral.border,
    },
    preferenceRow: {
      minHeight: 84,
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
    },
    preferenceCopy: { flex: 1, gap: spacing.xxs },
    preferenceLabel: {
      color: themeColors.neutral.textPrimary,
      fontSize: typography.size.label,
      lineHeight: typography.lineHeight.label,
      fontWeight: typography.weight.bold,
    },
    preferenceDescription: {
      color: themeColors.neutral.textSecondary,
      fontSize: typography.size.caption,
      lineHeight: typography.lineHeight.caption,
    },
    separator: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: themeColors.neutral.border,
    },
    retentionText: {
      color: themeColors.neutral.textSecondary,
      fontSize: typography.size.caption,
      lineHeight: typography.lineHeight.caption,
    },
    error: {
      color: themeColors.semantic.error,
      fontSize: typography.size.caption,
      lineHeight: typography.lineHeight.caption,
      fontWeight: typography.weight.medium,
    },
    historyLink: {
      minHeight: 44,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: spacing.xs,
    },
    historyLinkPressed: { opacity: 0.7 },
    historyLinkText: {
      color: themeColors.brand.secondary,
      fontSize: typography.size.label,
      fontWeight: typography.weight.bold,
    },
  });
}
