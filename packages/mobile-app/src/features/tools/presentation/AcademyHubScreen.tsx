import { colors, radius, spacing, typography } from "@/core/theme";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useNavigationFooterOffset } from "@/core/ui/NavigationFooter";

import { Card } from "@/core/ui/Card";
import { ListHeader } from "@/core/ui/ListHeader";
import { Screen } from "@/core/ui/Screen";
import { listPublishedAcademyArticlesUseCase } from "@/features/academy/application";
import { generatedAcademyRepository } from "@/features/academy/data";
import { createAcademyHubCards } from "@/features/academy/presentation";
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
  const bottomPadding = useNavigationFooterOffset();
  const router = useRouter();
  const academyCards = createAcademyHubCards(
    listPublishedAcademyArticlesUseCase(generatedAcademyRepository),
    academyTopics,
  );

  return (
    <Screen>
      <ListHeader
        title="Académie brassicole"
        subtitle="Base pédagogique, scientifique et historique du brassage"
      />

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: bottomPadding },
        ]}
      >
        {academyCards.map((card) => {
          const iconColor =
            card.slug === "glossaire"
              ? colors.semantic.warning
              : colors.brand.primary;

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
                  <View
                    style={[
                      styles.itemIcon,
                      { backgroundColor: iconColor + "25" },
                    ]}
                  >
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
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {},
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
