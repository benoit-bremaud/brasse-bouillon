import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { colors, radius, spacing, typography } from "@/core/theme";
import { Card } from "@/core/ui/Card";

import type { BeerListItemVM } from "@/features/beer-catalog/application/beer-catalog.view-model";

type Props = {
  beer: BeerListItemVM;
  onPress: () => void;
};

/** Catalogue list row (browse + search) — renders a `BeerListItemVM`. */
export function BeerCard({ beer, onPress }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Ouvrir la bière ${beer.title}`}
      onPress={onPress}
    >
      <Card style={styles.card}>
        <View style={styles.row}>
          <View
            style={[styles.swatch, { backgroundColor: beer.heroColorHex }]}
          />
          <View style={styles.content}>
            <Text style={styles.title} numberOfLines={1}>
              {beer.title}
            </Text>
            <Text style={styles.subtitle} numberOfLines={1}>
              {beer.subtitle}
            </Text>
            <Text style={styles.stats} numberOfLines={1}>
              {beer.abvLabel} · IBU {beer.ibuLabel}
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
}

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.sm,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  swatch: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    marginRight: spacing.sm,
  },
  content: {
    flex: 1,
    minWidth: 0,
    paddingRight: spacing.xs,
  },
  title: {
    fontSize: typography.size.body,
    lineHeight: typography.lineHeight.body,
    fontWeight: typography.weight.bold,
    color: colors.neutral.textPrimary,
  },
  subtitle: {
    fontSize: typography.size.label,
    lineHeight: typography.lineHeight.label,
    color: colors.neutral.textSecondary,
  },
  stats: {
    marginTop: spacing.xxs,
    fontSize: typography.size.caption,
    lineHeight: typography.lineHeight.caption,
    color: colors.neutral.muted,
  },
});
