import { useNavigationFooterOffset } from "@/core/ui/NavigationFooter";
import { colors, radius, spacing, typography } from "@/core/theme";
import {
  Image,
  LayoutChangeEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
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
import { GlossaryTerm } from "@/features/academy/domain";
import { AcademyArticleRenderer } from "@/features/academy/presentation";
import { Badge } from "@/core/ui/Badge";
import { Card } from "@/core/ui/Card";
import { EmptyStateCard } from "@/core/ui/EmptyStateCard";
import { HeaderBackButton } from "@/core/ui/HeaderBackButton";
import { ListHeader } from "@/core/ui/ListHeader";
import { PrimaryButton } from "@/core/ui/PrimaryButton";
import { Screen } from "@/core/ui/Screen";
import { createAcademyHubCards } from "@/features/academy/presentation";
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
  const scrollViewRef = React.useRef<ScrollView>(null);
  const articleTopOffsetRef = React.useRef(0);
  const sectionOffsetsRef = React.useRef<Record<string, number>>({});
  const normalizedSlug = normalizeRouteParam(slugParam);
  const normalizedTermSlug = normalizeRouteParam(termSlugParam);
  const topic = getAcademyTopicBySlug(normalizedSlug);
  const displayableTopic = getDisplayableAcademyTopicBySlug(normalizedSlug);
  const calculatorLabel = "Ouvrir le calculateur";
  const generatedArticle = normalizedSlug
    ? getAcademyArticleBySlug(generatedAcademyRepository, normalizedSlug)
    : null;
  const publishedGeneratedArticle =
    generatedArticle?.metadata.status === "published" ? generatedArticle : null;
  const publishedArticleNavigation = normalizedSlug
    ? getPublishedArticleNavigation(normalizedSlug)
    : null;
  const highlightedGlossaryTerm =
    normalizedSlug === "glossaire" && normalizedTermSlug
      ? getAcademyGlossaryTermBySlug(
          generatedAcademyRepository,
          normalizedTermSlug,
        )
      : null;
  const relatedGlossaryTerms = highlightedGlossaryTerm
    ? getRelatedGlossaryTerms(highlightedGlossaryTerm)
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
          ref={scrollViewRef}
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

          {highlightedGlossaryTerm ? (
            <AcademyHighlightedGlossaryTerm
              term={highlightedGlossaryTerm}
              relatedTerms={relatedGlossaryTerms}
              onRelatedTermPress={(termSlug) =>
                router.push({
                  pathname: "/(app)/academy/[slug]",
                  params: { slug: "glossaire", termSlug },
                })
              }
            />
          ) : null}

          {normalizedSlug === "glossaire" ? (
            <AcademyGlossaryTermsList
              terms={glossaryTerms}
              totalTermsCount={glossaryTermsTotal}
              query={glossaryQuery}
              onQueryChange={setGlossaryQuery}
              selectedTermSlug={highlightedGlossaryTerm?.slug ?? null}
              onTermPress={(termSlug) =>
                router.push({
                  pathname: "/(app)/academy/[slug]",
                  params: { slug: "glossaire", termSlug },
                })
              }
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
              onGlossaryPress={(termSlug) =>
                router.push({
                  pathname: "/(app)/academy/[slug]",
                  params: { slug: "glossaire", termSlug },
                })
              }
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

type AcademyHighlightedGlossaryTermProps = {
  readonly term: GlossaryTerm;
  readonly relatedTerms: readonly GlossaryTerm[];
  readonly onRelatedTermPress: (termSlug: string) => void;
};

function AcademyHighlightedGlossaryTerm({
  term,
  relatedTerms,
  onRelatedTermPress,
}: AcademyHighlightedGlossaryTermProps) {
  const aliases =
    term.aliases.length > 0 ? `Alias : ${term.aliases.join(", ")}` : null;

  return (
    <Card style={styles.highlightedGlossaryCard} variant="subtle">
      <Text style={styles.highlightedGlossaryEyebrow}>Terme recherché</Text>
      <Text style={styles.highlightedGlossaryTitle}>{term.label}</Text>
      <Text style={styles.highlightedGlossarySummary}>
        {term.shortDefinition}
      </Text>
      <Text style={styles.highlightedGlossaryDetails}>
        {term.detailedDefinition}
      </Text>
      {aliases ? (
        <Text style={styles.highlightedGlossaryAliases}>{aliases}</Text>
      ) : null}
      {term.sources.length > 0 ? (
        <View style={styles.glossarySourcesSection}>
          <Text style={styles.glossarySourcesTitle}>Sources</Text>
          <View style={styles.glossarySourcesList}>
            {term.sources.map((source) => (
              <View key={source.id} style={styles.glossarySourceItem}>
                <Text style={styles.glossarySourceTitle}>
                  {source.title}
                  {source.year ? ` (${source.year})` : ""}
                </Text>
                <Text style={styles.glossarySourceMeta}>
                  {[source.authors.join(", "), source.publisher]
                    .filter(Boolean)
                    .join(" · ")}
                </Text>
              </View>
            ))}
          </View>
        </View>
      ) : null}
      {relatedTerms.length > 0 ? (
        <View style={styles.relatedGlossarySection}>
          <Text style={styles.relatedGlossaryTitle}>Termes associés</Text>
          <View style={styles.relatedGlossaryTerms}>
            {relatedTerms.map((relatedTerm) => (
              <Pressable
                key={relatedTerm.slug}
                accessibilityRole="button"
                accessibilityLabel={`Consulter le terme associé ${relatedTerm.label}`}
                onPress={() => onRelatedTermPress(relatedTerm.slug)}
                style={styles.relatedGlossaryTerm}
              >
                <Text style={styles.relatedGlossaryTermText}>
                  {relatedTerm.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      ) : null}
    </Card>
  );
}

function getRelatedGlossaryTerms(term: GlossaryTerm): readonly GlossaryTerm[] {
  return term.relatedTerms
    .map((slug) =>
      getAcademyGlossaryTermBySlug(generatedAcademyRepository, slug),
    )
    .filter((relatedTerm): relatedTerm is GlossaryTerm => relatedTerm !== null);
}

type AcademyGlossaryTermsListProps = {
  readonly terms: readonly GlossaryTerm[];
  readonly totalTermsCount: number;
  readonly query: string;
  readonly onQueryChange: (query: string) => void;
  readonly selectedTermSlug: string | null;
  readonly onTermPress: (termSlug: string) => void;
};

function AcademyGlossaryTermsList({
  terms,
  totalTermsCount,
  query,
  onQueryChange,
  selectedTermSlug,
  onTermPress,
}: AcademyGlossaryTermsListProps) {
  const trimmedQuery = query.trim();
  const countLabel = trimmedQuery
    ? formatGlossarySearchCount(terms.length)
    : formatGlossaryTermsCount(totalTermsCount);

  return (
    <Card style={styles.glossaryListCard}>
      <View style={styles.glossaryListHeader}>
        <Text style={styles.glossaryListTitle}>Tous les termes</Text>
        <Text style={styles.glossaryListCount}>{countLabel}</Text>
      </View>

      <View style={styles.glossarySearchBox}>
        <TextInput
          accessibilityLabel="Rechercher un terme du glossaire"
          value={query}
          onChangeText={onQueryChange}
          placeholder="Rechercher un terme"
          placeholderTextColor={colors.neutral.muted}
          style={styles.glossarySearchInput}
          autoCorrect={false}
          autoCapitalize="none"
          returnKeyType="search"
          maxLength={80}
        />
        {query.length > 0 ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Effacer la recherche du glossaire"
            onPress={() => onQueryChange("")}
            style={styles.glossarySearchClearButton}
          >
            <Text style={styles.glossarySearchClearText}>Effacer</Text>
          </Pressable>
        ) : null}
      </View>

      {terms.length > 0 ? (
        <View style={styles.glossaryTermsList}>
          {terms.map((term) => {
            const selected = term.slug === selectedTermSlug;

            return (
              <Pressable
                key={term.slug}
                accessibilityRole="button"
                accessibilityLabel={`Consulter le terme ${term.label}`}
                accessibilityState={{ selected }}
                onPress={() => onTermPress(term.slug)}
                style={[
                  styles.glossaryTermItem,
                  selected && styles.glossaryTermItemSelected,
                ]}
              >
                <Text
                  style={[
                    styles.glossaryTermTitle,
                    selected && styles.glossaryTermTitleSelected,
                  ]}
                >
                  {term.label}
                </Text>
                <Text style={styles.glossaryTermSummary}>
                  {term.shortDefinition}
                </Text>
              </Pressable>
            );
          })}
        </View>
      ) : (
        <Text style={styles.glossaryEmptyText}>
          Aucun terme ne correspond à cette recherche.
        </Text>
      )}
    </Card>
  );
}

function formatGlossaryTermsCount(count: number): string {
  return count > 1 ? `${count} termes` : `${count} terme`;
}

function formatGlossarySearchCount(count: number): string {
  return count === 1 ? `${count} terme trouvé` : `${count} termes trouvés`;
}

type ArticleNavigationItem = {
  readonly slug: string;
  readonly title: string;
};

type PublishedArticleNavigation = {
  readonly previous: ArticleNavigationItem | null;
  readonly next: ArticleNavigationItem | null;
};

function getPublishedArticleNavigation(
  currentSlug: string,
): PublishedArticleNavigation {
  const cards = createAcademyHubCards(
    listPublishedAcademyArticlesUseCase(generatedAcademyRepository),
    academyTopics,
  ).filter((card) => card.source === "generated");
  const currentIndex = cards.findIndex((card) => card.slug === currentSlug);

  if (currentIndex < 0) {
    return { previous: null, next: null };
  }

  const previous = cards[currentIndex - 1] ?? null;
  const next = cards[currentIndex + 1] ?? null;

  return {
    previous: previous ? { slug: previous.slug, title: previous.title } : null,
    next: next ? { slug: next.slug, title: next.title } : null,
  };
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
  highlightedGlossaryCard: {
    gap: spacing.xs,
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  highlightedGlossaryEyebrow: {
    color: colors.brand.primary,
    fontSize: typography.size.caption,
    lineHeight: typography.lineHeight.caption,
    fontWeight: typography.weight.bold,
  },
  highlightedGlossaryTitle: {
    color: colors.neutral.textPrimary,
    fontSize: typography.size.body,
    lineHeight: typography.lineHeight.body,
    fontWeight: typography.weight.bold,
  },
  highlightedGlossarySummary: {
    color: colors.neutral.textPrimary,
    fontSize: typography.size.label,
    lineHeight: typography.lineHeight.label,
    fontWeight: typography.weight.bold,
  },
  highlightedGlossaryDetails: {
    color: colors.neutral.textSecondary,
    fontSize: typography.size.label,
    lineHeight: typography.lineHeight.label,
  },
  highlightedGlossaryAliases: {
    color: colors.neutral.muted,
    fontSize: typography.size.caption,
    lineHeight: typography.lineHeight.caption,
  },
  glossarySourcesSection: {
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  glossarySourcesTitle: {
    color: colors.neutral.textPrimary,
    fontSize: typography.size.label,
    lineHeight: typography.lineHeight.label,
    fontWeight: typography.weight.bold,
  },
  glossarySourcesList: {
    gap: spacing.xs,
  },
  glossarySourceItem: {
    borderLeftWidth: spacing.xxs,
    borderLeftColor: colors.neutral.border,
    paddingLeft: spacing.xs,
  },
  glossarySourceTitle: {
    color: colors.neutral.textPrimary,
    fontSize: typography.size.caption,
    lineHeight: typography.lineHeight.caption,
    fontWeight: typography.weight.bold,
  },
  glossarySourceMeta: {
    color: colors.neutral.muted,
    fontSize: typography.size.caption,
    lineHeight: typography.lineHeight.caption,
  },
  relatedGlossarySection: {
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  relatedGlossaryTitle: {
    color: colors.neutral.textPrimary,
    fontSize: typography.size.label,
    lineHeight: typography.lineHeight.label,
    fontWeight: typography.weight.bold,
  },
  relatedGlossaryTerms: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
  },
  relatedGlossaryTerm: {
    borderWidth: 1,
    borderColor: colors.brand.primary,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  relatedGlossaryTermText: {
    color: colors.brand.primary,
    fontSize: typography.size.caption,
    lineHeight: typography.lineHeight.caption,
    fontWeight: typography.weight.bold,
  },
  glossaryListCard: {
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  glossaryListHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  glossaryListTitle: {
    flex: 1,
    color: colors.neutral.textPrimary,
    fontSize: typography.size.body,
    lineHeight: typography.lineHeight.body,
    fontWeight: typography.weight.bold,
  },
  glossaryListCount: {
    color: colors.neutral.muted,
    fontSize: typography.size.caption,
    lineHeight: typography.lineHeight.caption,
  },
  glossaryTermsList: {
    gap: spacing.xs,
  },
  glossarySearchBox: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.neutral.border,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    gap: spacing.xs,
  },
  glossarySearchInput: {
    flex: 1,
    minWidth: 0,
    color: colors.neutral.textPrimary,
    fontSize: typography.size.body,
    lineHeight: typography.lineHeight.body,
    paddingVertical: 0,
  },
  glossarySearchClearButton: {
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xxs,
  },
  glossarySearchClearText: {
    color: colors.brand.primary,
    fontSize: typography.size.caption,
    lineHeight: typography.lineHeight.caption,
    fontWeight: typography.weight.bold,
  },
  glossaryTermItem: {
    borderWidth: 1,
    borderColor: colors.neutral.border,
    borderRadius: radius.md,
    padding: spacing.sm,
    gap: spacing.xxs,
  },
  glossaryTermItemSelected: {
    borderColor: colors.brand.primary,
    backgroundColor: colors.state.infoBackground,
  },
  glossaryTermTitle: {
    color: colors.neutral.textPrimary,
    fontSize: typography.size.label,
    lineHeight: typography.lineHeight.label,
    fontWeight: typography.weight.bold,
  },
  glossaryTermTitleSelected: {
    color: colors.brand.primary,
  },
  glossaryTermSummary: {
    color: colors.neutral.textSecondary,
    fontSize: typography.size.caption,
    lineHeight: typography.lineHeight.caption,
  },
  glossaryEmptyText: {
    color: colors.neutral.textSecondary,
    fontSize: typography.size.label,
    lineHeight: typography.lineHeight.label,
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
