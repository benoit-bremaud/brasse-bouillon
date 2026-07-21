import { useRouter } from "expo-router";
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
import { useAccountPreferences } from "@/core/preferences/account-preferences-context";
import { radius, spacing, typography, useTheme } from "@/core/theme";
import type { ThemeColors } from "@/core/theme";
import { HeaderBackButton } from "@/core/ui/HeaderBackButton";
import { PrimaryButton } from "@/core/ui/PrimaryButton";
import { Screen } from "@/core/ui/Screen";
import { ScreenScrollView } from "@/core/ui/ScreenScrollView";
import {
  getAccountPreferences,
  getDefaultAccountPreferences,
  saveAccountPreferences,
} from "@/features/profile/application/account-preferences.use-cases";
import type {
  AccountPreferences,
  UnitSystem,
} from "@/features/profile/domain/account-preferences.types";

type ChoiceProps<T extends string> = {
  accessibilityLabel: string;
  value: T;
  options: Array<{ label: string; value: T }>;
  onChange: (value: T) => void;
};

function ChoiceGroup<T extends string>({
  accessibilityLabel,
  value,
  options,
  onChange,
}: ChoiceProps<T>) {
  const { colors: themeColors } = useTheme();
  const styles = useMemo(() => createStyles(themeColors), [themeColors]);

  return (
    <View accessibilityLabel={accessibilityLabel} style={styles.choiceGroup}>
      {options.map((option) => (
        <Pressable
          accessibilityRole="radio"
          accessibilityState={{ selected: option.value === value }}
          key={option.value}
          onPress={() => onChange(option.value)}
          style={({ pressed }) => [
            styles.choice,
            option.value === value && styles.choiceSelected,
            pressed && styles.pressed,
          ]}
        >
          <Text
            style={[
              styles.choiceText,
              option.value === value && styles.choiceTextSelected,
            ]}
          >
            {option.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

type ToggleRowProps = {
  label: string;
  description: string;
  value: boolean;
  disabled?: boolean;
  onChange: (value: boolean) => void;
};

function ToggleRow({
  label,
  description,
  value,
  disabled = false,
  onChange,
}: ToggleRowProps) {
  const { colors: themeColors } = useTheme();
  const styles = useMemo(() => createStyles(themeColors), [themeColors]);

  return (
    <View style={styles.toggleRow}>
      <View style={styles.copy}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>
      <Switch
        accessibilityLabel={label}
        disabled={disabled}
        ios_backgroundColor={themeColors.neutral.border}
        onValueChange={onChange}
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

export function AccountPreferencesScreen() {
  const router = useRouter();
  const { colors: themeColors, setThemeMode } = useTheme();
  const { setUnitSystem } = useAccountPreferences();
  const styles = useMemo(() => createStyles(themeColors), [themeColors]);
  const [preferences, setPreferences] = useState<AccountPreferences>(() =>
    getDefaultAccountPreferences(),
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadPreferences = async () => {
      try {
        const storedPreferences = await getAccountPreferences();
        if (isMounted) {
          setPreferences(storedPreferences);
        }
      } catch (error) {
        if (isMounted) {
          setErrorMessage(
            getErrorMessage(error, "Impossible de charger tes préférences."),
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadPreferences();
    return () => {
      isMounted = false;
    };
  }, []);

  const updatePreference = <K extends keyof AccountPreferences>(
    key: K,
    value: AccountPreferences[K],
  ) => {
    setPreferences((current) => ({ ...current, [key]: value }));
  };

  const handleSave = async () => {
    if (isSaving) {
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);
    try {
      const savedPreferences = await saveAccountPreferences(preferences);
      setPreferences(savedPreferences);
      setThemeMode(savedPreferences.theme);
      setUnitSystem(savedPreferences.units);
      router.back();
    } catch (error) {
      setErrorMessage(
        getErrorMessage(error, "Impossible d'enregistrer tes préférences."),
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Screen>
      <ScreenScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <HeaderBackButton
          accessibilityLabel="Retour au profil"
          label="Profil"
          onPress={() => router.back()}
        />
        <View style={styles.intro}>
          <Text style={styles.eyebrow}>PERSONNALISATION</Text>
          <Text style={styles.title}>Préférences de l'application</Text>
          <Text style={styles.subtitle}>
            Choisis les réglages qui correspondent à ta manière de brasser.
          </Text>
        </View>

        {isLoading ? (
          <View style={styles.loading}>
            <ActivityIndicator color={themeColors.brand.secondary} />
            <Text style={styles.description}>Chargement des préférences…</Text>
          </View>
        ) : (
          <View style={styles.form}>
            {/* The theme selector is intentionally not surfaced yet: dark mode
                is gated off in ThemeProvider until every screen is theme-aware
                (a dedicated epic). The `theme` preference stays in the model so
                the control can return once the migration lands. */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Unités de brassage</Text>
              <Text style={styles.label}>Système préféré</Text>
              <ChoiceGroup<UnitSystem>
                accessibilityLabel="Choisir le système d'unités"
                onChange={(value) => updatePreference("units", value)}
                options={[
                  { label: "Métrique", value: "metric" },
                  { label: "Impérial", value: "imperial" },
                ]}
                value={preferences.units}
              />
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Notifications</Text>
              <ToggleRow
                description="Active ou désactive les notifications de l'application."
                label="Notifications"
                onChange={(value) =>
                  updatePreference("notificationsEnabled", value)
                }
                value={preferences.notificationsEnabled}
              />
              <View style={styles.separator} />
              <ToggleRow
                description="Rappels liés à tes brassins en cours."
                label="Rappels de brassage"
                onChange={(value) =>
                  updatePreference("brewingRemindersEnabled", value)
                }
                value={preferences.brewingRemindersEnabled}
              />
              <View style={styles.separator} />
              <ToggleRow
                description="Nouveautés et évolutions de Brasse Bouillon."
                label="Actualités de l'application"
                onChange={(value) =>
                  updatePreference("productUpdatesEnabled", value)
                }
                value={preferences.productUpdatesEnabled}
              />
            </View>

            {errorMessage ? (
              <Text style={styles.error}>{errorMessage}</Text>
            ) : null}
            <PrimaryButton
              accessibilityLabel="Enregistrer mes préférences de l'application"
              disabled={isSaving}
              label={isSaving ? "Enregistrement…" : "Enregistrer"}
              onPress={() => void handleSave()}
            />
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
    loading: {
      minHeight: 180,
      alignItems: "center",
      justifyContent: "center",
      gap: spacing.sm,
    },
    form: { gap: spacing.lg },
    section: { gap: spacing.sm },
    sectionTitle: {
      color: themeColors.neutral.textPrimary,
      fontSize: typography.size.label,
      fontWeight: typography.weight.bold,
    },
    label: {
      color: themeColors.neutral.textPrimary,
      fontSize: typography.size.label,
      fontWeight: typography.weight.medium,
    },
    description: {
      color: themeColors.neutral.textSecondary,
      fontSize: typography.size.caption,
      lineHeight: typography.lineHeight.caption,
    },
    note: {
      color: themeColors.neutral.textSecondary,
      fontSize: typography.size.caption,
      lineHeight: typography.lineHeight.caption,
      fontStyle: "italic",
    },
    choiceGroup: {
      flexDirection: "row",
      gap: spacing.xs,
    },
    choice: {
      flex: 1,
      minHeight: 44,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: spacing.xs,
      borderWidth: 1,
      borderColor: themeColors.neutral.border,
      borderRadius: radius.md,
      backgroundColor: themeColors.neutral.white,
    },
    choiceSelected: {
      borderColor: themeColors.brand.secondary,
      backgroundColor: themeColors.brand.background,
    },
    choiceText: {
      color: themeColors.neutral.textSecondary,
      fontSize: typography.size.caption,
      fontWeight: typography.weight.medium,
    },
    choiceTextSelected: {
      color: themeColors.brand.secondary,
      fontWeight: typography.weight.bold,
    },
    toggleRow: {
      minHeight: 64,
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
    },
    copy: { flex: 1, gap: spacing.xxs },
    separator: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: themeColors.neutral.border,
    },
    error: {
      color: themeColors.semantic.error,
      fontSize: typography.size.caption,
      lineHeight: typography.lineHeight.caption,
      fontWeight: typography.weight.medium,
    },
    pressed: { opacity: 0.85 },
  });
}
