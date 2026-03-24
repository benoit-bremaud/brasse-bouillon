import { colors, radius, spacing, typography } from "@/core/theme";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { Card } from "@/core/ui/Card";
import { ListHeader } from "@/core/ui/ListHeader";
import { Screen } from "@/core/ui/Screen";
import { academyTopics } from "@/features/tools/data";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";

const CALCULATOR_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  fermentescibles: "calculator-outline",
  couleur: "color-palette-outline",
  houblons: "leaf-outline",
  eau: "water-outline",
  rendement: "speedometer-outline",
  levures: "flask-outline",
  carbonatation: "beer-outline",
  avances: "analytics-outline",
};

export function ToolsHubScreen() {
  const router = useRouter();

  const calculatorTopics = academyTopics
    .filter((topic) => topic.hasCalculator)
    .slice()
    .sort(
      (a, b) => (a.calculatorOrder ?? a.order) - (b.calculatorOrder ?? b.order),
    );

  return (
    <Screen>
      <ListHeader
        title="Calculateurs"
        subtitle="Tes outils de calcul brassicoles"
      />

      <ScrollView contentContainerStyle={styles.content}>
        {calculatorTopics.map((topic) => (
          <Pressable
            key={topic.slug}
            accessibilityRole="button"
            accessibilityLabel={`Ouvrir le calculateur ${topic.title}`}
            onPress={() =>
              router.push({
                pathname: "/(app)/tools/[slug]/calculator",
                params: { slug: topic.slug },
              })
            }
            style={({ pressed }) => [
              styles.cardPressable,
              pressed && styles.cardPressablePressed,
            ]}
          >
            <Card style={styles.card}>
              <View style={styles.cardRow}>
                <View style={styles.itemIcon}>
                  <Ionicons
                    name={CALCULATOR_ICONS[topic.slug] ?? "calculator-outline"}
                    size={24}
                    color={colors.brand.secondary}
                  />
                </View>
                <View style={styles.cardInfo}>
                  <Text style={styles.cardTitle}>{topic.title}</Text>
                  <Text style={styles.cardMeta}>
                    {topic.calculatorDescription ?? topic.shortDescription}
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
        ))}
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
    backgroundColor: colors.brand.secondary + "25",
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
  },
  cardMeta: {
    color: colors.neutral.textSecondary,
    fontSize: typography.size.label,
    lineHeight: typography.lineHeight.label,
    marginTop: spacing.xxs,
  },
});
