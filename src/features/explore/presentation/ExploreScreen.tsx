import { colors, spacing, typography } from "@/core/theme";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { Card } from "@/core/ui/Card";
import { ListHeader } from "@/core/ui/ListHeader";
import { Screen } from "@/core/ui/Screen";
import { useRouter } from "expo-router";
import React from "react";

export function ExploreScreen() {
  const router = useRouter();

  return (
    <Screen>
      <ListHeader
        title="Explore"
        subtitle="Public recipes, ingredients and brewing tools"
      />

      <Card style={styles.card}>
        <View style={styles.sectionHeader}>
          <Text style={styles.title}>Public recipes</Text>
          <Pressable onPress={() => router.push("/(app)/recipes")}>
            <Text style={styles.link}>Open</Text>
          </Pressable>
        </View>
        <Text style={styles.description}>
          Browse and discover community recipes, then save your favorites.
        </Text>
      </Card>

      <Card style={styles.card}>
        <View style={styles.sectionHeader}>
          <Text style={styles.title}>Ingredients catalog</Text>
          <Pressable onPress={() => router.push("/(app)/ingredients")}>
            <Text style={styles.link}>Open</Text>
          </Pressable>
        </View>
        <Text style={styles.description}>
          Access technical sheets for malts, hops and yeasts.
        </Text>
      </Card>

      <Card style={styles.card}>
        <View style={styles.sectionHeader}>
          <Text style={styles.title}>Brewing tools</Text>
          <Pressable onPress={() => router.push("/(app)/tools")}>
            <Text style={styles.link}>Open</Text>
          </Pressable>
        </View>
        <Text style={styles.description}>
          Use calculators (ABV, IBU, conversions) while preparing recipes or
          batches.
        </Text>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.sm,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.xs,
  },
  title: {
    color: colors.neutral.textPrimary,
    fontSize: typography.size.body,
    lineHeight: typography.lineHeight.body,
    fontWeight: typography.weight.bold,
  },
  link: {
    color: colors.brand.secondary,
    fontSize: typography.size.caption,
    lineHeight: typography.lineHeight.caption,
    fontWeight: typography.weight.medium,
  },
  description: {
    color: colors.neutral.textSecondary,
    fontSize: typography.size.label,
    lineHeight: typography.lineHeight.label,
  },
});
