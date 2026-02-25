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
import { Screen } from "@/core/ui/Screen";
import { academyTopics } from "@/features/tools/data";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { getAcademyMascotImage } from "./academy-mascot";

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

          return (
            <Pressable
              key={topic.slug}
              accessibilityRole="button"
              accessibilityLabel={`Ouvrir le thème ${topic.title}`}
              onPress={() =>
                router.push({
                  pathname: "/academy/[slug]",
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
                  <Image
                    source={getAcademyMascotImage(topic.mascotVariant)}
                    style={styles.mascot}
                    resizeMode="cover"
                    accessibilityRole="image"
                    accessibilityLabel={topic.mascotAlt}
                  />
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
                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color={colors.neutral.muted}
                  />
                </View>

                <View style={styles.badgesRow}>
                  <Badge label={topic.focus} />
                  <Badge label={topic.estimatedReadTime} />
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
  mascot: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.semantic.info,
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
  badgesRow: {
    marginTop: spacing.sm,
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.neutral.border,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
  },
});
