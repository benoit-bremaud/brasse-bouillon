import { useNavigationFooterOffset } from "@/core/ui/NavigationFooter";
import { colors, spacing, typography } from "@/core/theme";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";

import { normalizeRouteParam } from "@/core/navigation/route-params";
import { getAcademyArticleBySlug } from "@/features/academy/application";
import { generatedAcademyRepository } from "@/features/academy/data";
import { AcademyArticleRenderer } from "@/features/academy/presentation";
import { Badge } from "@/core/ui/Badge";
import { Card } from "@/core/ui/Card";
import { EmptyStateCard } from "@/core/ui/EmptyStateCard";
import { HeaderBackButton } from "@/core/ui/HeaderBackButton";
import { ListHeader } from "@/core/ui/ListHeader";
import { PrimaryButton } from "@/core/ui/PrimaryButton";
import { Screen } from "@/core/ui/Screen";
import {
  getAcademyTopicBySlug,
  getDisplayableAcademyTopicBySlug,
} from "@/features/tools/data";
import { useRouter } from "expo-router";
import React from "react";
import { getAcademyMascotImage } from "./academy-mascot";

type Props = {
  slugParam?: string | string[];
};

export function AcademyTopicDetailsScreen({ slugParam }: Props) {
  const router = useRouter();
  const bottomPadding = useNavigationFooterOffset();
  const normalizedSlug = normalizeRouteParam(slugParam);
  const topic = getAcademyTopicBySlug(normalizedSlug);
  const displayableTopic = getDisplayableAcademyTopicBySlug(normalizedSlug);
  const calculatorLabel = "Ouvrir le calculateur";
  const generatedArticle = normalizedSlug
    ? getAcademyArticleBySlug(generatedAcademyRepository, normalizedSlug)
    : null;
  const publishedGeneratedArticle =
    generatedArticle?.metadata.status === "published" ? generatedArticle : null;
  const generatedArticleCalculatorSlug =
    publishedGeneratedArticle?.metadata.relatedCalculators[0]?.target.slug ??
    null;
  const legacyCalculatorSlug = topic?.hasCalculator ? topic.slug : null;
  const calculatorSlug = generatedArticleCalculatorSlug ?? legacyCalculatorSlug;
  const goBackOrAcademyHome = React.useCallback(() => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace("/(app)/academy");
  }, [router]);

  if (!topic && !publishedGeneratedArticle) {
    return (
      <Screen>
        <ListHeader
          title="Académie brassicole"
          subtitle="Thème introuvable"
          action={
            <HeaderBackButton
              label="Retour"
              accessibilityLabel="Retour à l'écran précédent"
              onPress={goBackOrAcademyHome}
            />
          }
        />
        <EmptyStateCard
          title="Thème introuvable"
          description="Ce thème n'existe pas (ou n'est plus disponible)."
          action={
            <PrimaryButton
              label="Retour au catalogue"
              onPress={() => router.replace("/(app)/academy")}
            />
          }
        />
      </Screen>
    );
  }

  if (publishedGeneratedArticle) {
    return (
      <Screen>
        <ListHeader
          title={publishedGeneratedArticle.metadata.title}
          subtitle="Article Académie"
          action={
            <HeaderBackButton
              label="Retour"
              accessibilityLabel="Retour à l'écran précédent"
              onPress={goBackOrAcademyHome}
            />
          }
        />

        <ScrollView
          contentContainerStyle={[
            styles.content,
            { paddingBottom: bottomPadding },
          ]}
        >
          {calculatorSlug ? (
            <Card style={styles.sectionCard}>
              <PrimaryButton
                label={calculatorLabel}
                onPress={() =>
                  router.push({
                    pathname: "/tools/[slug]/calculator",
                    params: { slug: calculatorSlug },
                  })
                }
              />
            </Card>
          ) : null}

          <AcademyArticleRenderer
            article={publishedGeneratedArticle}
            resolveArticleTitle={(slug) =>
              getAcademyArticleBySlug(generatedAcademyRepository, slug)
                ?.metadata.title ?? null
            }
            onCalculatorPress={(slug) =>
              router.push({
                pathname: "/tools/[slug]/calculator",
                params: { slug },
              })
            }
            onGlossaryPress={() =>
              router.push({
                pathname: "/(app)/academy/[slug]",
                params: { slug: "glossaire" },
              })
            }
            onRelatedArticlePress={(articleSlug) =>
              router.push({
                pathname: "/(app)/academy/[slug]",
                params: { slug: articleSlug },
              })
            }
          />
        </ScrollView>
      </Screen>
    );
  }

  if (!displayableTopic) {
    return null;
  }

  return (
    <Screen>
      <ListHeader
        title={displayableTopic.title}
        subtitle="Fiche thématique"
        action={
          <HeaderBackButton
            label="Retour"
            accessibilityLabel="Retour à l'écran précédent"
            onPress={goBackOrAcademyHome}
          />
        }
      />

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: bottomPadding },
        ]}
      >
        <Card style={styles.heroCard}>
          <View style={styles.heroTopRow}>
            <Image
              source={getAcademyMascotImage(displayableTopic.mascotVariant)}
              style={styles.mascot}
              accessibilityRole="image"
              accessibilityLabel={displayableTopic.mascotAlt}
            />
            <View style={styles.heroBody}>
              <Text style={styles.description}>
                {displayableTopic.shortDescription}
              </Text>
              <View style={styles.badgesRow}>
                <Badge label={displayableTopic.focus} />
                <Badge label={displayableTopic.estimatedReadTime} />
              </View>
            </View>
          </View>
        </Card>
        <Card style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Ce que tu trouveras bientôt</Text>
          <Text style={styles.bullet}>• Résumé structuré du chapitre</Text>
          <Text style={styles.bullet}>• Formules clés et explications</Text>
          <Text style={styles.bullet}>
            • Exemples pratiques et pièges fréquents
          </Text>
          <Text style={styles.bullet}>• Pont vers calculateur dédié</Text>
        </Card>

        <PrimaryButton
          label="En savoir plus"
          onPress={() =>
            router.push({
              pathname: "/academy/[slug]/learn",
              params: { slug: displayableTopic.slug },
            })
          }
        />

        {displayableTopic.hasCalculator ? (
          <PrimaryButton
            label={calculatorLabel}
            onPress={() =>
              router.push({
                pathname: "/tools/[slug]/calculator",
                params: { slug: displayableTopic.slug },
              })
            }
            style={styles.secondaryButtonSpacing}
          />
        ) : null}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {},
  heroCard: {
    marginBottom: spacing.sm,
  },
  heroTopRow: {
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
  description: {
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
  sectionCard: {
    marginBottom: spacing.sm,
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
  paragraph: {
    color: colors.neutral.textSecondary,
    fontSize: typography.size.label,
    lineHeight: typography.lineHeight.label,
    marginBottom: spacing.xs,
  },
  formula: {
    color: colors.neutral.textPrimary,
    fontSize: typography.size.label,
    lineHeight: typography.lineHeight.label,
    fontWeight: typography.weight.bold,
    marginBottom: spacing.xs,
  },
  secondaryButtonSpacing: {
    marginTop: spacing.xs,
  },
});
