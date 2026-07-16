import { colors, radius, spacing, typography } from "@/core/theme";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { ScreenScrollView } from "@/core/ui/ScreenScrollView";

import { Badge } from "@/core/ui/Badge";
import { Card } from "@/core/ui/Card";
import { ListHeader } from "@/core/ui/ListHeader";
import { Screen } from "@/core/ui/Screen";
import { listPublishedAcademyArticlesUseCase } from "@/features/academy/application";
import { generatedAcademyRepository } from "@/features/academy/data";
import {
  createAcademyHubCards,
  filterAcademyHubCardsByFocus,
  filterAcademyHubCards,
  listAcademyHubFocusFilters,
} from "@/features/academy/presentation";
import { academyTopics } from "@/features/tools/data";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";

const ACADEMY_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  histoire: "time-outline",
  introduction: "book-outline",
  fermentescibles: "calculator-outline",
  couleur: "color-palette-outline",
  houblons: "leaf-outline",
  eau: "water-outline",
  rendement: "speedometer-outline",
  levures: "flask-outline",
  carbonatation: "beer-outline",
  avances: "analytics-outline",
  glossaire: "library-outline",
};

export function AcademyHubScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedFocus, setSelectedFocus] = React.useState<string | null>(null);
  const academyCards = createAcademyHubCards(
    listPublishedAcademyArticlesUseCase(generatedAcademyRepository),
    academyTopics,
  );
  const focusFilters = listAcademyHubFocusFilters(academyCards);
  const focusFilteredAcademyCards = filterAcademyHubCardsByFocus(
    academyCards,
    selectedFocus,
  );
  const filteredAcademyCards = filterAcademyHubCards(
    focusFilteredAcademyCards,
    searchQuery,
  );
  const publishedArticleCount = academyCards.filter(
    (card) => card.source === "generated",
  ).length;
  const calculatorCount = academyCards.filter(
    (card) => card.hasCalculator,
  ).length;

  return (
    <Screen>
      <ListHeader
        title="Académie brassicole"
        subtitle="Base pédagogique, scientifique et historique du brassage"
      />

      <ScreenScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Card style={styles.summaryCard} variant="subtle">
          <View style={styles.summaryHeader}>
            <View style={styles.summaryIcon}>
              <Ionicons
                name="school-outline"
                size={22}
                color={colors.brand.secondary}
              />
            </View>
            <View style={styles.summaryBody}>
              <Text style={styles.summaryTitle}>
                Référence brassicole structurée
              </Text>
              <Text style={styles.summaryText}>
                Articles sourcés, notions clés et accès direct aux calculateurs
                associés.
              </Text>
            </View>
          </View>
          <View style={styles.summaryStats}>
            <Badge label={`${publishedArticleCount} articles`} variant="info" />
            <Badge label={`${calculatorCount} calculateurs`} variant="info" />
          </View>
        </Card>

        <View style={styles.searchContainer}>
          <Ionicons
            name="search-outline"
            size={18}
            color={colors.neutral.muted}
            style={styles.searchIcon}
          />
          <TextInput
            accessibilityLabel="Rechercher dans l'Académie brassicole"
            autoCapitalize="none"
            autoCorrect={false}
            maxLength={80}
            onChangeText={setSearchQuery}
            placeholder="Rechercher un article, un thème, une notion"
            placeholderTextColor={colors.neutral.muted}
            returnKeyType="search"
            style={styles.searchInput}
            testID="academy-search-input"
            value={searchQuery}
          />
          {searchQuery.length > 0 ? (
            <Pressable
              accessibilityLabel="Effacer la recherche Académie"
              accessibilityRole="button"
              onPress={() => setSearchQuery("")}
              testID="academy-search-clear"
            >
              <Ionicons
                name="close-circle"
                size={18}
                color={colors.neutral.muted}
              />
            </Pressable>
          ) : null}
        </View>

        {/* Raw ScrollView on purpose: this inner filter carousel is horizontal
            and nested in the page, so it must NOT reserve the nav-bar
            clearance — only the screen's own vertical scroller does. */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterList}
          keyboardShouldPersistTaps="handled"
        >
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ selected: selectedFocus === null }}
            accessibilityLabel="Afficher tous les articles Académie"
            onPress={() => setSelectedFocus(null)}
            style={[
              styles.filterChip,
              selectedFocus === null && styles.filterChipSelected,
            ]}
            testID="academy-filter-all"
          >
            <Text
              style={[
                styles.filterText,
                selectedFocus === null && styles.filterTextSelected,
              ]}
            >
              Tous
            </Text>
          </Pressable>
          {focusFilters.map((focus) => (
            <Pressable
              key={focus}
              accessibilityRole="button"
              accessibilityState={{ selected: selectedFocus === focus }}
              accessibilityLabel={`Filtrer les articles Académie par ${focus}`}
              onPress={() => setSelectedFocus(focus)}
              style={[
                styles.filterChip,
                selectedFocus === focus && styles.filterChipSelected,
              ]}
              testID={`academy-filter-${focus}`}
            >
              <Text
                style={[
                  styles.filterText,
                  selectedFocus === focus && styles.filterTextSelected,
                ]}
              >
                {focus}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {filteredAcademyCards.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>Aucun résultat</Text>
            <Text style={styles.emptyText}>
              Essaie avec un autre ingrédient, calculateur ou terme brassicole.
            </Text>
          </Card>
        ) : null}

        {filteredAcademyCards.map((card) => {
          const iconColor =
            card.slug === "glossaire"
              ? colors.semantic.warning
              : colors.brand.primary;
          const iconBackgroundStyle =
            card.slug === "glossaire"
              ? styles.itemIconWarning
              : styles.itemIconPrimary;

          return (
            <Pressable
              key={card.slug}
              accessibilityRole="button"
              accessibilityLabel={`Ouvrir le thème ${card.title}`}
              onPress={() =>
                router.push({
                  pathname: "/(app)/academy/[slug]",
                  params: { slug: card.slug },
                })
              }
              style={({ pressed }) => [
                styles.cardPressable,
                pressed && styles.cardPressablePressed,
              ]}
            >
              <Card style={styles.card}>
                <View style={styles.cardRow}>
                  <View style={[styles.itemIcon, iconBackgroundStyle]}>
                    <Ionicons
                      name={ACADEMY_ICONS[card.slug] ?? "book-outline"}
                      size={24}
                      color={iconColor}
                    />
                  </View>
                  <View style={styles.cardInfo}>
                    <Text style={styles.cardTitle}>{card.title}</Text>
                    <Text style={styles.cardMeta}>{card.summary}</Text>
                    <Text style={styles.cardContext}>
                      {card.focus} · {card.estimatedReadTime}
                    </Text>
                  </View>
                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color={colors.neutral.muted}
                  />
                </View>
              </Card>
            </Pressable>
          );
        })}
      </ScreenScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {},
  summaryCard: {
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  summaryHeader: {
    flexDirection: "row",
    gap: spacing.sm,
    alignItems: "center",
  },
  summaryIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.state.warningBackground,
    justifyContent: "center",
    alignItems: "center",
  },
  summaryBody: {
    flex: 1,
    minWidth: 0,
  },
  summaryTitle: {
    color: colors.neutral.textPrimary,
    fontSize: typography.size.body,
    lineHeight: typography.lineHeight.body,
    fontWeight: typography.weight.bold,
  },
  summaryText: {
    color: colors.neutral.textSecondary,
    fontSize: typography.size.label,
    lineHeight: typography.lineHeight.label,
    marginTop: spacing.xxs,
  },
  summaryStats: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.neutral.white,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    marginBottom: spacing.sm,
  },
  filterList: {
    gap: spacing.xs,
    paddingBottom: spacing.sm,
  },
  filterChip: {
    borderWidth: 1,
    borderColor: colors.neutral.border,
    borderRadius: radius.full,
    backgroundColor: colors.neutral.white,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  filterChipSelected: {
    backgroundColor: colors.brand.secondary,
    borderColor: colors.brand.secondary,
  },
  filterText: {
    color: colors.neutral.textSecondary,
    fontSize: typography.size.label,
    lineHeight: typography.lineHeight.label,
    fontWeight: typography.weight.medium,
  },
  filterTextSelected: {
    color: colors.neutral.white,
  },
  searchIcon: {
    marginRight: spacing.xs,
  },
  searchInput: {
    flex: 1,
    minWidth: 0,
    color: colors.neutral.textPrimary,
    fontSize: typography.size.body,
    paddingVertical: 0,
  },
  emptyCard: {
    padding: spacing.md,
  },
  emptyTitle: {
    color: colors.neutral.textPrimary,
    fontSize: typography.size.body,
    lineHeight: typography.lineHeight.body,
    fontWeight: typography.weight.bold,
  },
  emptyText: {
    color: colors.neutral.textSecondary,
    fontSize: typography.size.label,
    lineHeight: typography.lineHeight.label,
    marginTop: spacing.xxs,
  },
  cardPressable: {
    borderRadius: radius.lg,
    marginBottom: spacing.sm,
  },
  cardPressablePressed: {
    opacity: 0.92,
    transform: [{ scale: 0.995 }],
  },
  card: {
    padding: spacing.md,
  },
  cardRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  itemIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    justifyContent: "center",
    alignItems: "center",
  },
  itemIconPrimary: {
    backgroundColor: colors.state.infoBackground,
  },
  itemIconWarning: {
    backgroundColor: colors.state.warningBackground,
  },
  cardInfo: {
    flex: 1,
  },
  cardTitle: {
    color: colors.neutral.textPrimary,
    fontSize: typography.size.body,
    lineHeight: typography.lineHeight.body,
    fontWeight: typography.weight.bold,
    flex: 1,
    paddingRight: spacing.xs,
  },
  cardMeta: {
    color: colors.neutral.textSecondary,
    fontSize: typography.size.label,
    lineHeight: typography.lineHeight.label,
    marginTop: spacing.xxs,
  },
  cardContext: {
    color: colors.neutral.muted,
    fontSize: typography.size.caption,
    lineHeight: typography.lineHeight.caption,
    marginTop: spacing.xxs,
  },
});
