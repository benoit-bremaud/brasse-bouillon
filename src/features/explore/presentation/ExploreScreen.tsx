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
        title="Explorer"
        subtitle="Recettes, ingrédients et académie brassicole"
      />

      <Card style={styles.card}>
        <View style={styles.sectionHeader}>
          <Text style={styles.title}>Recettes publiques</Text>
          <Pressable onPress={() => router.push("/(app)/recipes")}>
            <Text style={styles.link}>Ouvrir</Text>
          </Pressable>
        </View>
        <Text style={styles.description}>
          Parcours les recettes de la communauté et enregistre tes favorites.
        </Text>
      </Card>

      <Card style={styles.card}>
        <View style={styles.sectionHeader}>
          <Text style={styles.title}>Catalogue ingrédients</Text>
          <Pressable onPress={() => router.push("/(app)/ingredients")}>
            <Text style={styles.link}>Ouvrir</Text>
          </Pressable>
        </View>
        <Text style={styles.description}>
          Accède aux fiches techniques des malts, houblons et levures.
        </Text>
      </Card>

      <Card style={styles.card}>
        <View style={styles.sectionHeader}>
          <Text style={styles.title}>Académie brassicole</Text>
          <Pressable onPress={() => router.push("/(app)/academy")}>
            <Text style={styles.link}>Ouvrir</Text>
          </Pressable>
        </View>
        <Text style={styles.description}>
          Accède au référentiel théorique et aux futurs calculateurs par thème
          brassicole.
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
