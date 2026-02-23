import { colors, radius, spacing, typography } from "@/core/theme";
import { academyTopics } from "@/features/tools/data";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { Badge } from "@/core/ui/Badge";
import { Card } from "@/core/ui/Card";
import { ListHeader } from "@/core/ui/ListHeader";
import { Screen } from "@/core/ui/Screen";
import { useRouter } from "expo-router";
import React from "react";

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
          <Pressable
            key={topic.slug}
            accessibilityRole="button"
            accessibilityLabel={`Ouvrir le thème ${topic.title}`}
            onPress={() =>
              router.push({
                pathname: "/tools/[slug]",
                params: { slug: topic.slug },
              })
            }
            style={({ pressed }) => [
              styles.cardPressable,
              pressed && styles.cardPressablePressed,
            ]}
          >
            <Card style={styles.card}>
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

              <Text style={styles.cardDescription}>
                {topic.shortDescription}
              </Text>

              <View style={styles.badgesRow}>
                <Badge label={topic.focus} />
                <Badge label={topic.estimatedReadTime} />
                <Badge
                  label={
                    topic.status === "ready" ? "Prêt" : "Bientôt disponible"
                  }
                  variant={topic.status === "ready" ? "success" : "neutral"}
                />
              </View>

              <View style={styles.cardFooter}>
                <Text style={styles.cardFooterText}>Ouvrir le thème</Text>
                <Text style={styles.cardFooterArrow}>→</Text>
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
  cardHeader: {
    flexDirection: "row",
    gap: spacing.sm,
    alignItems: "center",
    justifyContent: "space-between",
  },
  mascot: {
    width: 64,
    height: 64,
    borderRadius: radius.md,
    backgroundColor: colors.semantic.info,
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
    marginTop: spacing.sm,
  },
  badgesRow: {
    marginTop: spacing.sm,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
  },
  cardFooter: {
    marginTop: spacing.sm,
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.neutral.border,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardFooterText: {
    color: colors.brand.secondary,
    fontSize: typography.size.caption,
    lineHeight: typography.lineHeight.caption,
    fontWeight: typography.weight.medium,
  },
  cardFooterArrow: {
    color: colors.brand.secondary,
    fontSize: typography.size.body,
    lineHeight: typography.lineHeight.body,
    fontWeight: typography.weight.bold,
  },
});
