import { colors, radius, spacing, typography } from "@/core/theme";
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
        {academyTopics.map((topic, index) => (
          <Card key={topic.slug} style={styles.card}>
            <View
              style={[
                styles.cardTopRow,
                index % 2 === 1 && styles.cardTopRowReversed,
              ]}
            >
              <View style={styles.cardBody}>
                <Text style={styles.cardTitle}>{topic.title}</Text>
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
              </View>

              <Image
                source={topic.mascotImage}
                style={styles.mascot}
                resizeMode="cover"
                accessibilityRole="image"
                accessibilityLabel={topic.mascotAlt}
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

              {topic.hasCalculator ? (
                <Pressable
                  onPress={() =>
                    router.push({
                      pathname: "/tools/[slug]/calculator",
                      params: { slug: topic.slug },
                    })
                  }
                  style={styles.secondaryAction}
                >
                  <Text style={styles.secondaryActionLabel}>
                    Accéder au calcul
                  </Text>
                </Pressable>
              ) : null}
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
  cardTopRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  cardTopRowReversed: {
    flexDirection: "row-reverse",
  },
  mascot: {
    width: 72,
    height: 72,
    borderRadius: radius.md,
    backgroundColor: colors.semantic.info,
  },
  cardBody: {
    flex: 1,
  },
  cardTitle: {
    color: colors.neutral.textPrimary,
    fontSize: typography.size.body,
    lineHeight: typography.lineHeight.body,
    fontWeight: typography.weight.bold,
    marginBottom: spacing.xxs,
  },
  cardDescription: {
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
  actions: {
    marginTop: spacing.sm,
    gap: spacing.xs,
  },
  primaryAction: {
    width: "100%",
  },
  secondaryAction: {
    borderWidth: 1,
    borderColor: colors.neutral.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    alignItems: "center",
    backgroundColor: colors.neutral.white,
  },
  secondaryActionLabel: {
    color: colors.brand.secondary,
    fontSize: typography.size.label,
    lineHeight: typography.lineHeight.label,
    fontWeight: typography.weight.medium,
  },
});
