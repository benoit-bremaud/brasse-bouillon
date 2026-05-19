import { StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";

import { colors, radius, shadows, spacing, typography } from "@/core/theme";
import { Card } from "@/core/ui/Card";
import { HeaderBackButton } from "@/core/ui/HeaderBackButton";
import { ListHeader } from "@/core/ui/ListHeader";
import { PrimaryButton } from "@/core/ui/PrimaryButton";
import { Screen } from "@/core/ui/Screen";
import { useNavigationFooterOffset } from "@/core/ui/NavigationFooter";

const HERO_BEER = {
  name: "La Première du dimanche",
  style: "Blonde simple",
  brewer: "Marie",
  packagedOn: "12 mai 2026",
  durationDays: 20,
} as const;

const STATS: ReadonlyArray<{ label: string; value: string }> = [
  { label: "ABV", value: "4,8 %" },
  { label: "IBU", value: "22" },
  { label: "Volume", value: "5 L" },
  { label: "EBC", value: "8" },
];

const TIMELINE: ReadonlyArray<{ date: string; label: string }> = [
  { date: "22 avril", label: "Empâtage et ébullition" },
  { date: "23 avril", label: "Levurage US-05" },
  { date: "6 mai", label: "Fin de fermentation" },
  { date: "12 mai", label: "Mise en bouteille" },
];

export function BatchFinishedScreen() {
  const bottomPadding = useNavigationFooterOffset();
  const router = useRouter();

  const handleGoBack = () => {
    router.back();
  };

  return (
    <Screen>
      <ListHeader
        title="Brassin terminé"
        subtitle="Ta première bière est prête à déguster"
        action={
          <HeaderBackButton
            label="Retour"
            accessibilityLabel="Retour à la liste des brassins"
            onPress={handleGoBack}
          />
        }
      />

      <View style={styles.kicker}>
        <Text style={styles.kickerEmoji} accessible={false}>
          🍻
        </Text>
        <Text style={styles.kickerText}>
          Mise en bouteille le {HERO_BEER.packagedOn}
        </Text>
      </View>

      <Card style={styles.bottleCard}>
        <View style={styles.bottleLabel}>
          <Text style={styles.labelOverline}>Brasserie maison</Text>
          <Text style={styles.labelTitle}>{HERO_BEER.name}</Text>
          <Text style={styles.labelStyle}>{HERO_BEER.style}</Text>
          <View style={styles.labelDivider} />
          <Text style={styles.labelStats}>
            4,8 % alc./vol. · 33 cl · brassée par {HERO_BEER.brewer}
          </Text>
        </View>
      </Card>

      <Text style={styles.sectionTitle}>Ta bière en chiffres</Text>
      <View style={styles.statsGrid}>
        {STATS.map((stat) => (
          <Card key={stat.label} style={styles.statCard}>
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </Card>
        ))}
      </View>

      <Text style={styles.sectionTitle}>
        {HERO_BEER.durationDays} jours du grain à la bouteille
      </Text>
      <Card style={styles.timelineCard}>
        {TIMELINE.map((entry, index) => (
          <View
            key={entry.date}
            style={[
              styles.timelineRow,
              index === TIMELINE.length - 1 ? styles.timelineRowLast : null,
            ]}
          >
            <Text style={styles.timelineDate}>{entry.date}</Text>
            <Text style={styles.timelineLabel}>{entry.label}</Text>
          </View>
        ))}
      </Card>

      <View style={[styles.ctaStack, { paddingBottom: bottomPadding }]}>
        <PrimaryButton label="Noter ma dégustation" onPress={handleGoBack} />
        <Text style={styles.ctaHint}>
          Partage ton brassin avec la communauté depuis l’onglet Communauté.
        </Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  kicker: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  kickerEmoji: {
    fontSize: typography.size.h2,
    marginRight: spacing.xs,
  },
  kickerText: {
    color: colors.neutral.textSecondary,
    fontSize: typography.size.label,
    lineHeight: typography.lineHeight.label,
  },
  bottleCard: {
    padding: spacing.lg,
    marginBottom: spacing.md,
    backgroundColor: colors.brand.primary,
    borderRadius: radius.lg,
    ...shadows.md,
  },
  bottleLabel: {
    alignItems: "center",
    paddingVertical: spacing.md,
  },
  labelOverline: {
    color: colors.neutral.white,
    fontSize: typography.size.caption,
    lineHeight: typography.lineHeight.caption,
    letterSpacing: 2,
    textTransform: "uppercase",
    marginBottom: spacing.xs,
    opacity: 0.85,
  },
  labelTitle: {
    color: colors.neutral.white,
    fontSize: typography.size.h1,
    lineHeight: typography.lineHeight.h1,
    fontWeight: typography.weight.bold,
    textAlign: "center",
  },
  labelStyle: {
    color: colors.neutral.white,
    fontSize: typography.size.body,
    lineHeight: typography.lineHeight.body,
    marginTop: spacing.xxs,
    opacity: 0.92,
  },
  labelDivider: {
    height: 1,
    width: 64,
    backgroundColor: colors.neutral.white,
    opacity: 0.5,
    marginVertical: spacing.sm,
  },
  labelStats: {
    color: colors.neutral.white,
    fontSize: typography.size.label,
    lineHeight: typography.lineHeight.label,
    textAlign: "center",
    opacity: 0.92,
  },
  sectionTitle: {
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
    color: colors.neutral.textPrimary,
    fontSize: typography.size.body,
    lineHeight: typography.lineHeight.body,
    fontWeight: typography.weight.bold,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -spacing.xxs,
    marginBottom: spacing.md,
  },
  statCard: {
    flexBasis: "50%",
    flexGrow: 1,
    margin: spacing.xxs,
    padding: spacing.md,
    alignItems: "center",
  },
  statValue: {
    color: colors.neutral.textPrimary,
    fontSize: typography.size.h2,
    lineHeight: typography.lineHeight.h2,
    fontWeight: typography.weight.bold,
  },
  statLabel: {
    color: colors.neutral.textSecondary,
    fontSize: typography.size.caption,
    lineHeight: typography.lineHeight.caption,
    marginTop: spacing.xxs,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  timelineCard: {
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  timelineRow: {
    flexDirection: "row",
    alignItems: "baseline",
    paddingVertical: spacing.xs,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.neutral.textSecondary,
  },
  timelineRowLast: {
    borderBottomWidth: 0,
  },
  timelineDate: {
    width: 96,
    color: colors.brand.secondary,
    fontSize: typography.size.label,
    lineHeight: typography.lineHeight.label,
    fontWeight: typography.weight.medium,
  },
  timelineLabel: {
    flex: 1,
    color: colors.neutral.textPrimary,
    fontSize: typography.size.label,
    lineHeight: typography.lineHeight.label,
  },
  ctaStack: {
    marginTop: spacing.xs,
  },
  ctaHint: {
    marginTop: spacing.sm,
    color: colors.neutral.textSecondary,
    fontSize: typography.size.caption,
    lineHeight: typography.lineHeight.caption,
    textAlign: "center",
  },
});
