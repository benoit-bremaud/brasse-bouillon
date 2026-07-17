import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { getErrorMessage } from "@/core/http/http-error";
import { spacing, typography, useTheme } from "@/core/theme";
import type { ThemeColors } from "@/core/theme";
import { Card } from "@/core/ui/Card";
import { HeaderBackButton } from "@/core/ui/HeaderBackButton";
import { PrimaryButton } from "@/core/ui/PrimaryButton";
import { Screen } from "@/core/ui/Screen";
import { ScreenScrollView } from "@/core/ui/ScreenScrollView";
import { exportPersonalData } from "@/features/profile/application/personal-data-export.use-cases";

export function ExportDataScreen() {
  const router = useRouter();
  const { colors: themeColors } = useTheme();
  const styles = useMemo(() => createStyles(themeColors), [themeColors]);
  const [isExporting, setIsExporting] = useState(false);
  const [hasExported, setHasExported] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleExport = async () => {
    if (isExporting) {
      return;
    }

    setIsExporting(true);
    setHasExported(false);
    setErrorMessage(null);

    try {
      await exportPersonalData();
      setHasExported(true);
    } catch (error) {
      setErrorMessage(
        getErrorMessage(
          error,
          "Impossible de générer ou de partager tes données.",
        ),
      );
    } finally {
      setIsExporting(false);
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
          <Text style={styles.eyebrow}>DROIT D'ACCÈS</Text>
          <Text style={styles.title}>Exporter mes données</Text>
          <Text style={styles.subtitle}>
            Un export JSON rassemblera tes informations de compte et tes données
            personnelles dans un fichier que tu pourras conserver.
          </Text>
        </View>

        <Card style={styles.card}>
          <Text style={styles.cardTitle}>
            {hasExported ? "Export partagé" : "Export de mes données"}
          </Text>
          <Text style={styles.cardText}>
            {hasExported
              ? "Le fichier JSON a été généré et transmis au menu de partage de ton appareil."
              : "Le fichier rassemble ton compte, tes recettes, tes brassins, tes équipements, tes scans et tes préférences locales."}
          </Text>
        </Card>

        {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}

        <PrimaryButton
          accessibilityLabel="Exporter et partager mes données"
          disabled={isExporting}
          label={
            isExporting
              ? "Préparation…"
              : hasExported
                ? "Exporter à nouveau"
                : "Exporter mes données"
          }
          onPress={() => void handleExport()}
        />
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
    card: { gap: spacing.xs },
    cardTitle: {
      color: themeColors.brand.secondary,
      fontSize: typography.size.label,
      fontWeight: typography.weight.bold,
    },
    cardText: {
      color: themeColors.neutral.textSecondary,
      fontSize: typography.size.body,
      lineHeight: typography.lineHeight.body,
    },
    error: {
      color: themeColors.semantic.error,
      fontSize: typography.size.body,
      lineHeight: typography.lineHeight.body,
    },
  });
}
