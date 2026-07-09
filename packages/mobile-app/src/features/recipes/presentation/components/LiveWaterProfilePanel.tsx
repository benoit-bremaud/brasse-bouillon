import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { Badge } from "@/core/ui/Badge";
import { Card } from "@/core/ui/Card";
import { colors, radius, spacing, typography } from "@/core/theme";

import { describeWaterFreshness } from "@/features/recipes/application/water-profile.use-cases";
import type {
  LiveWaterMinerals,
  LiveWaterProfile,
  WaterConformity,
} from "@/features/recipes/domain/water-profile.types";

type Props = Readonly<{ profile: LiveWaterProfile }>;

type BadgeVariant = "success" | "warning" | "error" | "neutral";

const CONFORMITY_LABEL: Record<WaterConformity, string> = {
  C: "Conforme",
  N: "Non conforme",
  D: "Dérogation",
  S: "Surveillance renforcée",
  UNKNOWN: "Conformité inconnue",
};

const CONFORMITY_VARIANT: Record<WaterConformity, BadgeVariant> = {
  C: "success",
  N: "error",
  D: "warning",
  S: "warning",
  UNKNOWN: "neutral",
};

const ION_LABEL: Record<keyof LiveWaterMinerals, string> = {
  ca: "Calcium",
  mg: "Magnésium",
  cl: "Chlorures",
  so4: "Sulfates",
  hco3: "Bicarbonates",
};

const ION_ORDER: readonly (keyof LiveWaterMinerals)[] = [
  "ca",
  "mg",
  "cl",
  "so4",
  "hco3",
];

/** Plain-language hardness sentence — the app teaches (ADR-0025 § pedagogy). */
function hardnessSentence(hardnessFrench: number | null): string | null {
  if (hardnessFrench === null) {
    return null;
  }
  if (hardnessFrench < 15) {
    return "Eau douce — pauvre en calcaire.";
  }
  if (hardnessFrench < 30) {
    return "Eau moyennement dure.";
  }
  return "Eau dure — riche en calcaire.";
}

function formatMgL(value: number | null): string {
  return value === null ? "—" : `${value} mg/L`;
}

export function LiveWaterProfilePanel({ profile }: Props) {
  const minerals = profile.mineralsMgL;
  const hasPartialData =
    ION_ORDER.some((ion) => minerals[ion] === null) ||
    profile.hardnessFrench === null;
  const pedagogy = hardnessSentence(profile.hardnessFrench);
  const freshness = describeWaterFreshness(profile.freshnessDate, new Date());

  return (
    <Card variant="subtle" style={styles.card} testID="water-profile-panel">
      <View style={styles.headerRow}>
        <Text style={styles.network} numberOfLines={2}>
          {profile.networkName ?? "Réseau d'eau local"}
        </Text>
        <Badge
          label={CONFORMITY_LABEL[profile.conformity]}
          variant={CONFORMITY_VARIANT[profile.conformity]}
          accessibilityLabel={`Conformité : ${CONFORMITY_LABEL[profile.conformity]}`}
        />
      </View>

      <Text style={styles.caveat}>
        Plusieurs réseaux peuvent desservir la commune — profil du réseau
        principal.
      </Text>

      {ION_ORDER.map((ion) => (
        <View key={ion} style={styles.metricRow}>
          <Text style={styles.metricLabel}>{ION_LABEL[ion]}</Text>
          <Text style={styles.metricValue}>{formatMgL(minerals[ion])}</Text>
        </View>
      ))}

      <View style={styles.metricRow}>
        <Text style={styles.metricLabel}>Sodium</Text>
        <Text style={styles.metricMuted}>non mesuré</Text>
      </View>

      <View style={styles.metricRow}>
        <Text style={styles.metricLabel}>Dureté</Text>
        <Text style={styles.metricValue}>
          {profile.hardnessFrench === null
            ? "—"
            : `${profile.hardnessFrench} °fH`}
        </Text>
      </View>

      {pedagogy ? <Text style={styles.pedagogy}>{pedagogy}</Text> : null}

      {hasPartialData ? (
        <Text style={styles.partial}>
          Donnée partielle : certaines mesures manquent pour cette commune (ce
          n'est pas un signe de non-conformité).
        </Text>
      ) : null}

      {freshness ? (
        <View style={styles.freshnessRow} testID="water-freshness">
          <Badge
            label={freshness.label}
            variant={freshness.tone}
            accessibilityLabel={`Fraîcheur des analyses : ${freshness.label}, dernière analyse le ${freshness.dateLabel}`}
          />
          <Text style={styles.source}>
            Dernière analyse : {freshness.dateLabel} — source ARS via Hub'Eau.
          </Text>
        </View>
      ) : (
        <Text style={styles.source} testID="water-freshness-fallback">
          Analyses {profile.year} — source ARS via Hub'Eau.
        </Text>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  network: {
    flex: 1,
    fontSize: typography.size.body,
    fontWeight: typography.weight.bold,
    color: colors.neutral.textPrimary,
  },
  caveat: {
    fontSize: typography.size.caption,
    color: colors.neutral.textSecondary,
  },
  metricRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.xxs,
    borderTopWidth: 1,
    borderTopColor: colors.neutral.border,
  },
  metricLabel: {
    fontSize: typography.size.body,
    color: colors.neutral.textPrimary,
  },
  metricValue: {
    fontSize: typography.size.body,
    fontWeight: typography.weight.medium,
    color: colors.neutral.textPrimary,
  },
  metricMuted: {
    fontSize: typography.size.body,
    fontStyle: "italic",
    color: colors.neutral.textSecondary,
  },
  pedagogy: {
    fontSize: typography.size.label,
    fontWeight: typography.weight.medium,
    color: colors.brand.secondary,
    marginTop: spacing.xxs,
  },
  partial: {
    fontSize: typography.size.caption,
    color: colors.neutral.textSecondary,
    backgroundColor: colors.state.infoBackground,
    borderRadius: radius.sm,
    padding: spacing.xs,
  },
  source: {
    fontSize: typography.size.caption,
    color: colors.neutral.textSecondary,
    marginTop: spacing.xxs,
  },
  freshnessRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: spacing.xs,
    marginTop: spacing.xxs,
  },
});
