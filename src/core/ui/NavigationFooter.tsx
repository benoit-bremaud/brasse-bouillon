import { colors, spacing, typography } from "@/core/theme";
import { Href, useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type NavItem = {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  href: Href;
};

const NAV_ITEMS: NavItem[] = [
  { label: "Accueil", icon: "home", href: "/(app)/dashboard" },
  { label: "Brassins", icon: "cafe", href: "/(app)/batches" },
  { label: "Recettes", icon: "book", href: "/(app)/recipes" },
  { label: "Boutique", icon: "cart", href: "/(app)/shop" },
  { label: "Outils", icon: "calculator", href: "/(app)/tools" },
  { label: "Académie", icon: "school", href: "/(app)/academy" },
];

export function NavigationFooter() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[styles.container, { paddingBottom: spacing.xs + insets.bottom }]}
    >
      {NAV_ITEMS.map((item) => (
        <Pressable
          key={item.href as string}
          style={styles.item}
          onPress={() => router.replace(item.href)}
          accessibilityRole="button"
          accessibilityLabel={item.label}
        >
          <Ionicons name={item.icon} size={24} color={colors.brand.secondary} />
          <Text style={styles.label}>{item.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: colors.neutral.white,
    borderTopWidth: 1,
    borderTopColor: colors.neutral.border,
    paddingTop: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  item: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.xs,
  },
  label: {
    fontSize: typography.size.caption,
    color: colors.brand.secondary,
    marginTop: 2,
  },
});
