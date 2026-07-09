import { useNavigationFooterOffset } from "@/core/ui/NavigationFooter";
import { colors, radius, spacing, typography } from "@/core/theme";
import {
  Image,
  LayoutChangeEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { normalizeRouteParam } from "@/core/navigation/route-params";
import {
  getAcademyArticleBySlug,
  getAcademyGlossaryTermBySlug,
  listAcademyGlossaryTermsUseCase,
  listPublishedAcademyArticlesUseCase,
} from "@/features/academy/application";
import { generatedAcademyRepository } from "@/features/academy/data";
import {
  AcademyArticleRenderer,
  AcademyGlossaryTermsList,
  AcademyHighlightedGlossaryTerm,
  createAcademyHubCards,
  formatAcademyCalculatorButtonLabel,
  getPublishedAcademyArticleNavigation,
  listRelatedAcademyGlossaryTerms,
  resolveAcademyCalculatorSlug,
} from "@/features/academy/presentation";
import { Badge } from "@/core/ui/Badge";
import { Card } from "@/core/ui/Card";
import { EmptyStateCard } from "@/core/ui/EmptyStateCard";
import { HeaderBackButton } from "@/core/ui/HeaderBackButton";
import { ListHeader } from "@/core/ui/ListHeader";
import { PrimaryButton } from "@/core/ui/PrimaryButton";
import { Screen } from "@/core/ui/Screen";
import {
  academyTopics,
  getAcademyTopicBySlug,
  getDisplayableAcademyTopicBySlug,
} from "@/features/tools/data";
import { useRouter } from "expo-router";
import React from "react";
import { getAcademyMascotImage } from "./academy-mascot";

type Props = {
  slugParam?: string | string[];
  termSlugParam?: string | string[];
};

export function AcademyTopicDetailsScreen({ slugParam, termSlugParam }: Props) {
  const router = useRouter();
  const [glossaryQuery, setGlossaryQuery] = React.useState("");
  const bottomPadding = useNavigationFooterOffset();
  const screenBottomPadding = bottomPadding + spacing.xl;
  const scrollViewRef = React.useRef<ScrollView>(null);
  const articleTopOffsetRef = React.useRef(0);
  const sectionOffsetsRef = React.useRef<Record<string, number>>({});
  const normalizedSlug = normalizeRouteParam(slugParam);
  const normalizedTermSlug = normalizeRouteParam(termSlugParam);
  const topic = getAcademyTopicBySlug(normalizedSlug);
  const displayableTopic = getDisplayableAcademyTopicBySlug(normalizedSlug);
  const generatedArticle = normalizedSlug
    ? getAcademyArticleBySlug(generatedAcademyRepository, normalizedSlug)
    : null;
  const publishedGeneratedArticle =
    generatedArticle?.metadata.status === "published" ? generatedArticle : null;
  const publishedArticleNavigation = React.useMemo(() => {
    if (!normalizedSlug) {
      return null;
    }

    return getPublishedAcademyArticleNavigation(
      normalizedSlug,
      createAcademyHubCards(
        listPublishedAcademyArticlesUseCase(generatedAcademyRepository),
        academyTopics,
      ),
    );
  }, [normalizedSlug]);
  const highlightedGlossaryTerm =
    normalizedSlug === "glossaire" && normalizedTermSlug
      ? getAcademyGlossaryTermBySlug(
          generatedAcademyRepository,
          normalizedTermSlug,
        )
      : null;
  const relatedGlossaryTerms = highlightedGlossaryTerm
    ? listRelatedAcademyGlossaryTerms(highlightedGlossaryTerm, (slug) =>
        getAcademyGlossaryTermBySlug(generatedAcademyRepository, slug),
      )
    : [];
  const glossaryTerms =
    normalizedSlug === "glossaire"
      ? listAcademyGlossaryTermsUseCase(
          generatedAcademyRepository,
          glossaryQuery,
        )
      : [];
  const glossaryTermsTotal =
    normalizedSlug === "glossaire"
      ? listAcademyGlossaryTermsUseCase(generatedAcademyRepository).length
      : 0;
  const calculatorSlug = resolveAcademyCalculatorSlug(
    publishedGeneratedArticle,
    topic,
  );
  const calculatorLabel = formatAcademyCalculatorButtonLabel(
    calculatorSlug,
    resolveCalculatorLabel,
  );
  const goBackOrAcademyHome = React.useCallback(() => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace("/(app)/academy");
  }, [router]);
  const handleSectionLayout = React.useCallback(
    (sectionId: string, y: number) => {
      sectionOffsetsRef.current[sectionId] = y;
    },
    [],
  );
  const handleSectionPress = React.useCallback((sectionId: string) => {
    const y = sectionOffsetsRef.current[sectionId];

    if (typeof y !== "number") {
      return;
    }

    scrollViewRef.current?.scrollTo({
      y: Math.max(articleTopOffsetRef.current + y - spacing.sm, 0),
      animated: true,
    });
  }, []);
  const handleArticleLayout = React.useCallback((event: LayoutChangeEvent) => {
    articleTopOffsetRef.current = event.nativeEvent.layout.y;
  }, []);
  const openGlossaryTerm = React.useCallback(
    (termSlug: string) => {
      setGlossaryQuery("");
      router.push({
        pathname: "/(app)/academy/[slug]",
        params: { slug: "glossaire", termSlug },
      });
    },
    [router],
  );

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
          title="Académie brassicole"
          subtitle="Article de référence"
          action={
            <HeaderBackButton
              label="Retour"
              accessibilityLabel="Retour à l'écran précédent"
              onPress={goBackOrAcademyHome}
            />
          }
        />

        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={[
            styles.content,
            { paddingBottom: screenBottomPadding },
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

          {highlightedGlossaryTerm ? (
            <AcademyHighlightedGlossaryTerm
              term={highlightedGlossaryTerm}
              relatedTerms={relatedGlossaryTerms}
              onRelatedTermPress={openGlossaryTerm}
            />
          ) : null}

          {normalizedSlug === "glossaire" ? (
            <AcademyGlossaryTermsList
              terms={glossaryTerms}
              totalTermsCount={glossaryTermsTotal}
              query={glossaryQuery}
              onQueryChange={setGlossaryQuery}
              selectedTermSlug={highlightedGlossaryTerm?.slug ?? null}
              onTermPress={openGlossaryTerm}
            />
          ) : null}

          <View onLayout={handleArticleLayout}>
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
              onGlossaryPress={(termSlug) => openGlossaryTerm(termSlug)}
              onRelatedArticlePress={(articleSlug) =>
                router.push({
                  pathname: "/(app)/academy/[slug]",
                  params: { slug: articleSlug },
                })
              }
              onSectionLayout={handleSectionLayout}
              onSectionPress={handleSectionPress}
            />
          </View>

          <AcademyArticleFooterNavigation
            previousArticle={publishedArticleNavigation?.previous ?? null}
            nextArticle={publishedArticleNavigation?.next ?? null}
            onAcademyHomePress={() => router.replace("/(app)/academy")}
            onArticlePress={(slug) =>
              router.push({
                pathname: "/(app)/academy/[slug]",
                params: { slug },
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
          { paddingBottom: screenBottomPadding },
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
              pathname: "/(app)/academy/[slug]/learn",
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

type ArticleNavigationItem = {
  readonly slug: string;
  readonly title: string;
};

function resolveCalculatorLabel(slug: string): string | null {
  return (
    getAcademyArticleBySlug(generatedAcademyRepository, slug)?.metadata.title ??
    getAcademyTopicBySlug(slug)?.title ??
    null
  );
}

type AcademyArticleFooterNavigationProps = {
  readonly previousArticle: ArticleNavigationItem | null;
  readonly nextArticle: ArticleNavigationItem | null;
  readonly onAcademyHomePress: () => void;
  readonly onArticlePress: (slug: string) => void;
};

function AcademyArticleFooterNavigation({
  previousArticle,
  nextArticle,
  onAcademyHomePress,
  onArticlePress,
}: AcademyArticleFooterNavigationProps) {
  return (
    <Card style={styles.footerNavigationCard} variant="subtle">
      <Text style={styles.footerNavigationTitle}>Continuer la lecture</Text>
      <View style={styles.footerNavigationActions}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Retourner au catalogue de l'Académie"
          onPress={onAcademyHomePress}
          style={styles.footerHomeButton}
        >
          <Text style={styles.footerHomeButtonText}>Retour à l'Académie</Text>
        </Pressable>

        <View style={styles.footerAdjacentRow}>
          {previousArticle ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Lire l'article précédent : ${previousArticle.title}`}
              onPress={() => onArticlePress(previousArticle.slug)}
              style={styles.footerAdjacentButton}
            >
              <Text style={styles.footerAdjacentEyebrow}>Précédent</Text>
              <Text style={styles.footerAdjacentTitle}>
                {previousArticle.title}
              </Text>
            </Pressable>
          ) : null}

          {nextArticle ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Lire l'article suivant : ${nextArticle.title}`}
              onPress={() => onArticlePress(nextArticle.slug)}
              style={styles.footerAdjacentButton}
            >
              <Text style={styles.footerAdjacentEyebrow}>Suivant</Text>
              <Text style={styles.footerAdjacentTitle}>
                {nextArticle.title}
              </Text>
            </Pressable>
          ) : null}
        </View>
      </View>
    </Card>
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
  footerNavigationCard: {
    gap: spacing.sm,
  },
  footerNavigationTitle: {
    color: colors.neutral.textPrimary,
    fontSize: typography.size.body,
    lineHeight: typography.lineHeight.body,
    fontWeight: typography.weight.bold,
  },
  footerNavigationActions: {
    gap: spacing.sm,
  },
  footerHomeButton: {
    alignItems: "center",
    borderRadius: radius.md,
    backgroundColor: colors.brand.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
  },
  footerHomeButtonText: {
    color: colors.neutral.white,
    fontSize: typography.size.body,
    lineHeight: typography.lineHeight.body,
    fontWeight: typography.weight.bold,
  },
  footerAdjacentRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  footerAdjacentButton: {
    flex: 1,
    minWidth: 0,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    borderRadius: radius.md,
    backgroundColor: colors.neutral.white,
    padding: spacing.sm,
  },
  footerAdjacentEyebrow: {
    color: colors.neutral.muted,
    fontSize: typography.size.caption,
    lineHeight: typography.lineHeight.caption,
    fontWeight: typography.weight.bold,
    marginBottom: spacing.xxs,
  },
  footerAdjacentTitle: {
    color: colors.neutral.textPrimary,
    fontSize: typography.size.label,
    lineHeight: typography.lineHeight.label,
    fontWeight: typography.weight.bold,
  },
});
