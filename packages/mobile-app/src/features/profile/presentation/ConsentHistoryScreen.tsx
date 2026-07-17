import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { getErrorMessage } from "@/core/http/http-error";
import { spacing, typography, useTheme } from "@/core/theme";
import type { ThemeColors } from "@/core/theme";
import { Card } from "@/core/ui/Card";
import { HeaderBackButton } from "@/core/ui/HeaderBackButton";
import { useNavigationFooterOffset } from "@/core/ui/NavigationFooter";
import { Screen } from "@/core/ui/Screen";
import { listConsentDecisions } from "@/features/consent/application/consent.use-cases";
import type {
  ConsentAxis,
  ConsentDecision,
  ConsentSource,
} from "@/features/consent/domain/consent.types";

const AXIS_LABELS: Record<ConsentAxis, string> = {
  "scan.barcode": "Codes-barres",
  "scan.photos": "Photos de bouteille",
  "scan.metadata": "Métadonnées de scan",
  "scan.training": "Amélioration des modèles",
  "ml.training": "Entraînement des modèles",
  telemetry: "Télémétrie",
};

const SOURCE_LABELS: Record<ConsentSource, string> = {
  profile: "Profil",
  scan: "Scanner",
  system: "Système",
};

function formatDecisionDate(decidedAt: string): string {
  const date = new Date(decidedAt);
  if (Number.isNaN(date.getTime())) {
    return "Date inconnue";
  }

  return date.toLocaleString("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

type DecisionRowProps = {
  decision: ConsentDecision;
};

function DecisionRow({ decision }: DecisionRowProps) {
  const { colors: themeColors } = useTheme();
  const styles = useMemo(() => createStyles(themeColors), [themeColors]);
  const status = decision.value ? "Autorisé" : "Refusé";

  return (
    <View style={styles.decisionRow}>
      <View style={styles.decisionCopy}>
        <Text style={styles.decisionAxis}>{AXIS_LABELS[decision.axis]}</Text>
        <Text style={styles.decisionMetadata}>
          {SOURCE_LABELS[decision.source]} ·{" "}
          {formatDecisionDate(decision.decidedAt)}
        </Text>
      </View>
      <Text
        style={[
          styles.decisionStatus,
          decision.value ? styles.allowedStatus : styles.deniedStatus,
        ]}
      >
        {status}
      </Text>
    </View>
  );
}

export function ConsentHistoryScreen() {
  const router = useRouter();
  const { colors: themeColors } = useTheme();
  const styles = useMemo(() => createStyles(themeColors), [themeColors]);
  const bottomPadding = useNavigationFooterOffset();
  const [decisions, setDecisions] = useState<ConsentDecision[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadHistory = async () => {
      try {
        const storedDecisions = await listConsentDecisions();
        if (isMounted) {
          setDecisions(storedDecisions);
        }
      } catch (error) {
        if (isMounted) {
          setErrorMessage(
            getErrorMessage(
              error,
              "Impossible de charger l'historique des décisions.",
            ),
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadHistory();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: bottomPadding },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <HeaderBackButton
          accessibilityLabel="Retour à la confidentialité"
          label="Confidentialité"
          onPress={() => router.back()}
        />

        <View style={styles.intro}>
          <Text style={styles.eyebrow}>DONNÉES PERSONNELLES</Text>
          <Text style={styles.title}>Historique des décisions</Text>
          <Text style={styles.subtitle}>
            Consulte les changements enregistrés pour les consentements du
            scanner.
          </Text>
        </View>

        {isLoading ? (
          <View style={styles.loadingState}>
            <ActivityIndicator color={themeColors.brand.secondary} />
            <Text style={styles.feedbackText}>Chargement de l'historique…</Text>
          </View>
        ) : errorMessage ? (
          <Card variant="subtle">
            <Text style={styles.error}>{errorMessage}</Text>
          </Card>
        ) : decisions.length === 0 ? (
          <Card variant="subtle">
            <Text style={styles.feedbackText}>
              Aucune décision de consentement n'a encore été enregistrée.
            </Text>
          </Card>
        ) : (
          <Card style={styles.historyCard}>
            {decisions.map((decision, index) => (
              <React.Fragment
                key={`${decision.axis}-${decision.decidedAt}-${index}`}
              >
                {index > 0 ? <View style={styles.separator} /> : null}
                <DecisionRow decision={decision} />
              </React.Fragment>
            ))}
          </Card>
        )}
      </ScrollView>
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
    feedbackText: {
      color: themeColors.neutral.textSecondary,
      fontSize: typography.size.body,
      lineHeight: typography.lineHeight.body,
    },
    historyCard: { paddingVertical: spacing.xs },
    decisionRow: {
      minHeight: 68,
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
    },
    decisionCopy: { flex: 1, gap: spacing.xxs },
    decisionAxis: {
      color: themeColors.neutral.textPrimary,
      fontSize: typography.size.label,
      lineHeight: typography.lineHeight.label,
      fontWeight: typography.weight.bold,
    },
    decisionMetadata: {
      color: themeColors.neutral.textSecondary,
      fontSize: typography.size.caption,
      lineHeight: typography.lineHeight.caption,
    },
    decisionStatus: {
      minWidth: 70,
      fontSize: typography.size.caption,
      lineHeight: typography.lineHeight.caption,
      fontWeight: typography.weight.bold,
      textAlign: "right",
    },
    allowedStatus: { color: themeColors.semantic.success },
    deniedStatus: { color: themeColors.semantic.error },
    separator: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: themeColors.neutral.border,
    },
    error: {
      color: themeColors.semantic.error,
      fontSize: typography.size.body,
      lineHeight: typography.lineHeight.body,
      fontWeight: typography.weight.medium,
    },
  });
}
