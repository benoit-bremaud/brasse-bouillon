import { colors, radius, spacing, typography } from "@/core/theme";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";

import { Badge } from "@/core/ui/Badge";
import { Card } from "@/core/ui/Card";
import { ListHeader } from "@/core/ui/ListHeader";
import { PrimaryButton } from "@/core/ui/PrimaryButton";
import { Screen } from "@/core/ui/Screen";
import { useRouter } from "expo-router";
import React from "react";
import { academyTopics } from "./academy-topics";

export function AcademyHubScreen() {
  const router = useRouter();

  return (
    <Screen>
      <ListHeader
        title="Académie brassicole"
        subtitle="Base pédagogique, scientifique et historique du brassage"
      />

      <ScrollView contentContainerStyle={styles.content}>
        {academyTopics.map((topic) => (
          <Card key={topic.slug} style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>{topic.title}</Text>
              <Image
                source={topic.mascotImage}
                style={styles.mascot}
                resizeMode="cover"
                accessibilityRole="image"
                accessibilityLabel={topic.mascotAlt}
              />
            </View>

            <Text style={styles.cardDescription}>{topic.shortDescription}</Text>

            <View style={styles.badgesRow}>
              <Badge label={topic.focus} />
              <Badge label={topic.estimatedReadTime} />
              <Badge
                label={topic.status === "ready" ? "Prêt" : "Bientôt disponible"}
                variant={topic.status === "ready" ? "success" : "neutral"}
              />
            </View>

            <View style={styles.actions}>
              <PrimaryButton
                label="Explorer le thème"
                onPress={() =>
                  router.push({
                    pathname: "/tools/[slug]",
                    params: { slug: topic.slug },
                  })
                }
                style={styles.primaryAction}
              />
            </View>
          </Card>
        ))}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: spacing.lg,
  },
  card: {
    marginBottom: spacing.sm,
  },
  cardHeader: {
    flexDirection: "row",
    gap: spacing.sm,
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  mascot: {
    width: 72,
    height: 72,
    borderRadius: radius.md,
    backgroundColor: colors.semantic.info,
    marginTop: spacing.xxs,
  },
  cardTitle: {
    color: colors.neutral.textPrimary,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: typography.weight.bold,
    marginBottom: spacing.xxs,
    flex: 1,
    paddingRight: spacing.xs,
  },
  cardDescription: {
    color: colors.neutral.textSecondary,
    fontSize: typography.size.label,
    lineHeight: typography.lineHeight.label,
    marginTop: spacing.xs,
  },
  badgesRow: {
    marginTop: spacing.xs,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
  },
  actions: {
    marginTop: spacing.sm,
    gap: spacing.xs,
  },
  primaryAction: {
    width: "100%",
  },
});
