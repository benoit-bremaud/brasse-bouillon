import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { colors, radius, spacing, typography } from "@/core/theme";

export type RecipeDetailTabId =
  | "overview"
  | "ingredients"
  | "water"
  | "brewing"
  | "reviews";

type IoniconName = React.ComponentProps<typeof Ionicons>["name"];

export type RecipeDetailTab = Readonly<{
  id: RecipeDetailTabId;
  label: string;
  icon: IoniconName;
}>;

export const RECIPE_DETAIL_TABS: ReadonlyArray<RecipeDetailTab> = [
  { id: "overview", label: "Vue", icon: "home-outline" },
  { id: "ingredients", label: "Ingrédients", icon: "leaf-outline" },
  { id: "water", label: "Eau", icon: "water-outline" },
  { id: "brewing", label: "Brassage", icon: "flame-outline" },
  { id: "reviews", label: "Notes", icon: "chatbubbles-outline" },
];

type RecipeDetailSideRailProps = Readonly<{
  activeTab: RecipeDetailTabId;
  onChange: (tab: RecipeDetailTabId) => void;
}>;

/**
 * Vertical navigation rail for the redesigned recipe detail screen
 * (Issue #740, Round 4). Lives on the left edge: a 70px column that
 * stacks five icon + short-label buttons. Replaces the previous top
 * tab bar to free vertical space and to give the screen a recogni-
 * sable identity for the soutenance demo.
 *
 * Mirrors Brewfather web's left navigation pattern. Each entry is a
 * full-height button (icon above, label below) so the touch target
 * stays comfortable on phones (≥ 60×70px).
 */
export function RecipeDetailSideRail({
  activeTab,
  onChange,
}: RecipeDetailSideRailProps) {
  return (
    <View testID="recipe-detail-side-rail" style={styles.rail}>
      {RECIPE_DETAIL_TABS.map((tab) => {
        const isActive = tab.id === activeTab;
        const tint = isActive
          ? colors.brand.secondary
          : colors.neutral.textSecondary;

        return (
          <Pressable
            key={tab.id}
            testID={`recipe-detail-tab-${tab.id}`}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            accessibilityLabel={`Onglet ${tab.label}`}
            onPress={() => onChange(tab.id)}
            style={[styles.tab, isActive && styles.tabActive]}
          >
            {isActive ? <View style={styles.activeIndicator} /> : null}
            <Ionicons name={tab.icon} size={22} color={tint} />
            <Text style={[styles.label, { color: tint }]} numberOfLines={1}>
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  rail: {
    width: 72,
    paddingVertical: spacing.sm,
    backgroundColor: colors.neutral.white,
    borderRightWidth: StyleSheet.hairlineWidth,
    borderRightColor: colors.neutral.border,
  },
  tab: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xxs,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 64,
  },
  tabActive: {
    backgroundColor: colors.brand.background,
  },
  activeIndicator: {
    position: "absolute",
    right: 0,
    top: spacing.xs,
    bottom: spacing.xs,
    width: 3,
    borderRadius: radius.full,
    backgroundColor: colors.brand.secondary,
  },
  label: {
    marginTop: spacing.xxs,
    fontSize: typography.size.caption,
    lineHeight: typography.lineHeight.caption,
    fontWeight: typography.weight.medium,
    textAlign: "center",
  },
});
