import { colors, radius, spacing, typography } from "@/core/theme";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { Badge } from "@/core/ui/Badge";
import { Card } from "@/core/ui/Card";
import { ListHeader } from "@/core/ui/ListHeader";
import { Screen } from "@/core/ui/Screen";
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

  return (
    <Screen>
      <ListHeader
        title="Académie brassicole"
        subtitle="Base pédagogique, scientifique et historique du brassage"
      />

      <ScrollView contentContainerStyle={styles.content}>
        {academyTopics.map((topic) => {
          const isReady = topic.status === "ready";
          const iconColor =
            topic.slug === "glossaire"
              ? colors.semantic.warning
              : colors.brand.primary;

          return (
            <Pressable
              key={topic.slug}
              accessibilityRole="button"
              accessibilityLabel={`Ouvrir le thème ${topic.title}`}
              onPress={() =>
                router.push({
                  pathname: "/(app)/academy/[slug]",
                  params: { slug: topic.slug },
                })
              }
              style={({ pressed }) => [
                styles.cardPressable,
                !isReady && styles.cardPressableDisabled,
                pressed && isReady && styles.cardPressablePressed,
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
                      name={ACADEMY_ICONS[topic.slug] ?? "book-outline"}
                      size={24}
                      color={iconColor}
                    />
                  </View>
                  <View style={styles.cardInfo}>
                    <View style={styles.cardTopRow}>
                      <Text style={styles.cardTitle}>{topic.title}</Text>
                      <Badge
                        label={isReady ? "Prêt" : "Bientôt"}
                        variant={isReady ? "success" : "neutral"}
                      />
                    </View>
                    <Text style={styles.cardMeta}>
                      {topic.shortDescription}
                    </Text>
                  </View>
                  {isReady && (
                    <Ionicons
                      name="chevron-forward"
                      size={20}
                      color={colors.neutral.muted}
                    />
                  )}
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
  content: {
    paddingBottom: spacing.lg,
  },
  cardPressable: {
    borderRadius: radius.lg,
    marginBottom: spacing.sm,
  },
  cardPressableDisabled: {
    opacity: 0.6,
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
  cardTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
});
