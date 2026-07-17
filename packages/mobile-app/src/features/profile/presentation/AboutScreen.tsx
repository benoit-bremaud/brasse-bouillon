import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import { Linking, Pressable, StyleSheet, Text, View } from "react-native";

import { appInfo, getOtaInfo } from "@/core/config/app-info";
import { getErrorMessage } from "@/core/http/http-error";
import { spacing, typography, useTheme } from "@/core/theme";
import type { ThemeColors } from "@/core/theme";
import { Card } from "@/core/ui/Card";
import { HeaderBackButton } from "@/core/ui/HeaderBackButton";
import { Screen } from "@/core/ui/Screen";
import { ScreenScrollView } from "@/core/ui/ScreenScrollView";

type MetadataRowProps = {
  label: string;
  value: string;
};

// ADR-0028: supporting the project is a plain outbound Ko-fi link —
// no in-app payment SDK, no purchase flow.
const KOFI_URL = "https://ko-fi.com/brassebouillon";

const LEGAL_LINKS = [
  { label: "Mentions légales", url: "https://brasse-bouillon.com/legal" },
  {
    label: "Politique de confidentialité",
    url: "https://brasse-bouillon.com/privacy",
  },
  {
    label: "Conditions d'utilisation",
    url: "https://brasse-bouillon.com/terms",
  },
  { label: "Politique cookies", url: "https://brasse-bouillon.com/cookies" },
] as const;

function MetadataRow({ label, value }: MetadataRowProps) {
  const { colors: themeColors } = useTheme();
  const styles = useMemo(() => createStyles(themeColors), [themeColors]);

  return (
    <View style={styles.metadataRow}>
      <Text style={styles.metadataLabel}>{label}</Text>
      <Text style={styles.metadataValue}>{value}</Text>
    </View>
  );
}

export function AboutScreen() {
  const router = useRouter();
  const otaInfo = getOtaInfo();
  const { colors: themeColors } = useTheme();
  const styles = useMemo(() => createStyles(themeColors), [themeColors]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [supportErrorMessage, setSupportErrorMessage] = useState<string | null>(
    null,
  );

  const handleOpenLegalLink = async (url: string) => {
    setErrorMessage(null);

    try {
      await Linking.openURL(url);
    } catch (error) {
      setErrorMessage(
        getErrorMessage(error, "Impossible d'ouvrir cette page légale."),
      );
    }
  };

  const handleOpenKofi = async () => {
    setSupportErrorMessage(null);

    try {
      await Linking.openURL(KOFI_URL);
    } catch (error) {
      setSupportErrorMessage(
        getErrorMessage(error, "Impossible d'ouvrir la page de soutien."),
      );
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
          <Text style={styles.eyebrow}>APPLICATION</Text>
          <Text style={styles.title}>À propos de Brasse Bouillon</Text>
          <Text style={styles.subtitle}>
            Les informations de version utiles pour identifier cette instance de
            l'application.
          </Text>
        </View>

        <Card>
          <Text style={styles.cardTitle}>Identité de l'application</Text>
          <MetadataRow label="Version" value={appInfo.version} />
          <View style={styles.separator} />
          <MetadataRow label="Commit" value={appInfo.commit} />
          <View style={styles.separator} />
          <MetadataRow label="Build" value={appInfo.buildDate} />
          <View style={styles.separator} />
          <MetadataRow label="Canal OTA" value={otaInfo.channel} />
          <View style={styles.separator} />
          <MetadataRow label="Identifiant OTA" value={otaInfo.updateId} />
          <View style={styles.separator} />
          <MetadataRow
            label="Dernière mise à jour"
            value={otaInfo.lastUpdate}
          />
        </Card>

        <Card variant="subtle">
          <Text style={styles.cardTitle}>Support</Text>
          <Text style={styles.supportText}>
            Pour signaler un problème, indique la version et le commit affichés
            ci-dessus afin de faciliter le diagnostic.
          </Text>
        </Card>

        <Card variant="subtle">
          <Text style={styles.cardTitle}>Soutenir le projet</Text>
          <Text style={styles.supportText}>
            Brasse Bouillon est développé sur le temps libre d'un brasseur
            amateur. Le projet te plaît ? Tu peux soutenir son développement en
            m'offrant une bière.
          </Text>
          <Pressable
            accessibilityRole="link"
            accessibilityLabel="Offre-moi une bière sur Ko-fi"
            onPress={() => void handleOpenKofi()}
            style={({ pressed }) => [
              styles.legalLink,
              pressed && styles.legalLinkPressed,
            ]}
          >
            <Text style={styles.legalLinkText}>Offre-moi une bière</Text>
          </Pressable>
          {supportErrorMessage ? (
            <Text style={styles.error}>{supportErrorMessage}</Text>
          ) : null}
        </Card>

        <Card variant="subtle">
          <Text style={styles.cardTitle}>Informations légales</Text>
          <Text style={styles.supportText}>
            Les pages légales de Brasse Bouillon sont maintenues sur le site
            officiel et restent accessibles depuis cette application.
          </Text>
          <View style={styles.legalLinks}>
            {LEGAL_LINKS.map((link) => (
              <Pressable
                accessibilityRole="link"
                accessibilityLabel={`Ouvrir ${link.label}`}
                key={link.url}
                onPress={() => void handleOpenLegalLink(link.url)}
                style={({ pressed }) => [
                  styles.legalLink,
                  pressed && styles.legalLinkPressed,
                ]}
              >
                <Text style={styles.legalLinkText}>{link.label}</Text>
              </Pressable>
            ))}
          </View>
          {errorMessage ? (
            <Text style={styles.error}>{errorMessage}</Text>
          ) : null}
          <Text style={styles.supportText}>
            Merci aux projets open source et aux contributeurs qui rendent cette
            application possible.
          </Text>
        </Card>
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
    cardTitle: {
      color: themeColors.brand.secondary,
      fontSize: typography.size.label,
      lineHeight: typography.lineHeight.label,
      fontWeight: typography.weight.bold,
      textTransform: "uppercase",
      marginBottom: spacing.xs,
    },
    metadataRow: {
      minHeight: 44,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: spacing.sm,
    },
    metadataLabel: {
      color: themeColors.neutral.textSecondary,
      fontSize: typography.size.label,
      fontWeight: typography.weight.medium,
    },
    metadataValue: {
      flexShrink: 1,
      color: themeColors.neutral.textPrimary,
      fontSize: typography.size.label,
      textAlign: "right",
      fontVariant: ["tabular-nums"],
    },
    separator: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: themeColors.neutral.border,
    },
    supportText: {
      color: themeColors.neutral.textSecondary,
      fontSize: typography.size.body,
      lineHeight: typography.lineHeight.body,
    },
    legalLinks: { gap: spacing.xs },
    legalLink: {
      minHeight: 44,
      justifyContent: "center",
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: themeColors.neutral.border,
    },
    legalLinkPressed: { opacity: 0.7 },
    legalLinkText: {
      color: themeColors.brand.secondary,
      fontSize: typography.size.body,
      lineHeight: typography.lineHeight.body,
      fontWeight: typography.weight.medium,
    },
    error: {
      color: themeColors.semantic.error,
      fontSize: typography.size.body,
      lineHeight: typography.lineHeight.body,
    },
  });
}
