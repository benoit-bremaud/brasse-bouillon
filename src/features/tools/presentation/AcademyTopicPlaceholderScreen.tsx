import { colors, spacing, typography } from "@/core/theme";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { Badge } from "@/core/ui/Badge";
import { Card } from "@/core/ui/Card";
import { EmptyStateCard } from "@/core/ui/EmptyStateCard";
import { ListHeader } from "@/core/ui/ListHeader";
import { PrimaryButton } from "@/core/ui/PrimaryButton";
import { Screen } from "@/core/ui/Screen";
import { useRouter } from "expo-router";
import React from "react";
import { getAcademyTopicBySlug } from "./academy-topics";

type Props = {
  slugParam?: string;
  mode: "learn" | "calculator";
};

export function AcademyTopicPlaceholderScreen({ slugParam, mode }: Props) {
  const router = useRouter();
  const topic = getAcademyTopicBySlug(slugParam);

  if (!topic) {
    return (
      <Screen>
        <ListHeader
          title="Académie brassicole"
          subtitle="Page introuvable"
          action={
            <Pressable onPress={() => router.push("/tools")}>
              <Text style={styles.backLink}>← Retour</Text>
            </Pressable>
          }
        />
        <EmptyStateCard
          title="Impossible d'ouvrir cette page"
          description="Le thème demandé est invalide ou indisponible."
          action={
            <PrimaryButton
              label="Retour à l'académie"
              onPress={() => router.push("/tools")}
            />
          }
        />
      </Screen>
    );
  }

  const isLearn = mode === "learn";
  const title = isLearn ? "Contenu théorique" : "Calculateur";
  const subtitle = isLearn
    ? "Le contenu détaillé sera injecté dans une prochaine itération."
    : "Le calculateur thématique arrive bientôt.";

  return (
    <Screen>
      <ListHeader
        title={topic.title}
        subtitle={title}
        action={
          <Pressable
            onPress={() =>
              router.push({
                pathname: "/tools/[slug]",
                params: { slug: topic.slug },
              })
            }
          >
            <Text style={styles.backLink}>← Retour</Text>
          </Pressable>
        }
      />

      <ScrollView contentContainerStyle={styles.content}>
        <Card style={styles.heroCard}>
          <View style={styles.heroRow}>
            <Image
              source={topic.mascotImage}
              style={styles.mascot}
              accessibilityRole="image"
              accessibilityLabel={topic.mascotAlt}
            />

            <View style={styles.heroBody}>
              <Text style={styles.subtitle}>{subtitle}</Text>
              <View style={styles.badgesRow}>
                <Badge label={topic.focus} />
                <Badge label={isLearn ? "Apprentissage" : "Calcul pratique"} />
              </View>
            </View>
          </View>
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>Structure V1 prête</Text>
          <Text style={styles.bullet}>• Route dynamique en place</Text>
          <Text style={styles.bullet}>• Slug validé avec fallback robuste</Text>
          <Text style={styles.bullet}>
            • Emplacement prêt pour contenu final / logique calcul
          </Text>
        </Card>

        <PrimaryButton
          label="Retour à la fiche thématique"
          onPress={() =>
            router.push({
              pathname: "/tools/[slug]",
              params: { slug: topic.slug },
            })
          }
          style={styles.backButton}
        />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: spacing.lg,
  },
  heroCard: {
    marginBottom: spacing.sm,
  },
  heroRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  mascot: {
    width: 72,
    height: 72,
    borderRadius: 12,
  },
  heroBody: {
    flex: 1,
  },
  subtitle: {
    color: colors.neutral.textSecondary,
    fontSize: typography.size.label,
    lineHeight: typography.lineHeight.label,
  },
  badgesRow: {
    marginTop: spacing.xs,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
  },
  sectionTitle: {
    color: colors.neutral.textPrimary,
    fontSize: typography.size.body,
    lineHeight: typography.lineHeight.body,
    fontWeight: typography.weight.bold,
    marginBottom: spacing.xs,
  },
  bullet: {
    color: colors.neutral.textSecondary,
    fontSize: typography.size.label,
    lineHeight: typography.lineHeight.label,
    marginBottom: spacing.xxs,
  },
  backButton: {
    marginTop: spacing.sm,
  },
  backLink: {
    color: colors.brand.secondary,
    fontSize: typography.size.caption,
    lineHeight: typography.lineHeight.caption,
    fontWeight: typography.weight.medium,
  },
});
