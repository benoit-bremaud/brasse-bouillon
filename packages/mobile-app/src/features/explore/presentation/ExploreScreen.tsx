import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { colors, radius, spacing, typography } from "@/core/theme";

import { Card } from "@/core/ui/Card";
import { DISCOVERY_SPACES } from "@/features/explore/presentation/discovery-spaces";
import { Ionicons } from "@expo/vector-icons";
import { ListHeader } from "@/core/ui/ListHeader";
import React from "react";
import { Screen } from "@/core/ui/Screen";
import { useRouter } from "expo-router";

export function ExploreScreen() {
  const router = useRouter();

  return (
    <Screen>
      <ListHeader
        title="Explorer"
        subtitle="Parcours découverte guidés pour passer de l'idée au brassin"
      />

      <Card style={styles.positioningCard}>
        <Text style={styles.positioningTitle}>Pourquoi cet espace ?</Text>
        <Text style={styles.positioningText}>
          Explore rassemble des entrées thématiques transverses (ingrédients,
          eau, épices, matériel, académie) pour accélérer tes décisions de
          brassage sans parcourir chaque module séparément.
        </Text>
      </Card>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {DISCOVERY_SPACES.map((space) => (
          <Card key={space.id} style={styles.card}>
            <View style={styles.sectionHeader}>
              <View style={styles.titleWrap}>
                <View style={styles.iconWrap}>
                  <Ionicons
                    name={space.iconName}
                    size={18}
                    color={colors.brand.secondary}
                  />
                </View>
                <View style={styles.titleCol}>
                  <Text style={styles.title}>{space.title}</Text>
                  <Text style={styles.subtitle}>{space.subtitle}</Text>
                </View>
              </View>

              <Pressable
                onPress={() => router.push(space.href)}
                accessibilityRole="button"
                accessibilityLabel={`Ouvrir ${space.title}`}
                style={({ pressed }) => [
                  styles.linkButton,
                  pressed && styles.linkButtonPressed,
                ]}
              >
                <Text style={styles.link}>Ouvrir</Text>
              </Pressable>
            </View>

            <Text style={styles.description}>
              {space.accentEmoji} {space.description}
            </Text>
          </Card>
        ))}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: spacing.md,
  },
  positioningCard: {
    marginBottom: spacing.sm,
    borderColor: colors.brand.secondary,
    borderWidth: 1,
    backgroundColor: colors.brand.background,
  },
  positioningTitle: {
    color: colors.neutral.textPrimary,
    fontSize: typography.size.label,
    lineHeight: typography.lineHeight.label,
    fontWeight: typography.weight.bold,
    marginBottom: spacing.xxs,
  },
  positioningText: {
    color: colors.neutral.textSecondary,
    fontSize: typography.size.label,
    lineHeight: typography.lineHeight.label,
  },
  card: {
    marginBottom: spacing.sm,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: spacing.xs,
    gap: spacing.sm,
  },
  titleWrap: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.xs,
    flex: 1,
  },
  iconWrap: {
    width: 28,
    height: 28,
    borderRadius: radius.md,
    backgroundColor: colors.brand.background,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 1,
  },
  titleCol: {
    flex: 1,
  },
  title: {
    color: colors.neutral.textPrimary,
    fontSize: typography.size.body,
    lineHeight: typography.lineHeight.body,
    fontWeight: typography.weight.bold,
  },
  subtitle: {
    color: colors.neutral.textSecondary,
    fontSize: typography.size.caption,
    lineHeight: typography.lineHeight.caption,
    marginTop: spacing.xxs,
  },
  linkButton: {
    backgroundColor: colors.brand.background,
    borderWidth: 1,
    borderColor: colors.brand.secondary,
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
  },
  linkButtonPressed: {
    opacity: 0.85,
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
