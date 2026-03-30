import { Href, usePathname, useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, radius, spacing, typography } from "@/core/theme";

import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type NavItem = {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  href: Href;
  routePrefix: string;
};

const NAV_ITEMS: NavItem[] = [
  {
    label: "Accueil",
    icon: "home",
    href: "/dashboard",
    routePrefix: "/dashboard",
  },
  {
    label: "Brassins",
    icon: "cafe",
    href: "/batches",
    routePrefix: "/batches",
  },
  {
    label: "Recettes",
    icon: "book",
    href: "/recipes",
    routePrefix: "/recipes",
  },
  {
    label: "Boutique",
    icon: "cart",
    href: "/shop",
    routePrefix: "/shop",
  },
  {
    label: "Outils",
    icon: "calculator",
    href: "/tools",
    routePrefix: "/tools",
  },
  {
    label: "Académie",
    icon: "school",
    href: "/academy",
    routePrefix: "/academy",
  },
];

function isFooterItemActive(pathname: string, routePrefix: string): boolean {
  return pathname === routePrefix || pathname.startsWith(`${routePrefix}/`);
}

export function NavigationFooter() {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[styles.container, { paddingBottom: spacing.xs + insets.bottom }]}
    >
      {NAV_ITEMS.map((item) => {
        const isActive = isFooterItemActive(pathname, item.routePrefix);

        return (
          <Pressable
            key={item.href as string}
            style={({ pressed }) => [
              styles.item,
              isActive && styles.itemActive,
              pressed && styles.itemPressed,
            ]}
            onPress={() => router.replace(item.href)}
            accessibilityRole="button"
            accessibilityLabel={item.label}
            accessibilityState={{ selected: isActive }}
          >
            <Ionicons
              name={item.icon}
              size={24}
              color={isActive ? colors.brand.primary : colors.brand.secondary}
            />
            <Text style={[styles.label, isActive && styles.labelActive]}>
              {item.label}
            </Text>
          </Pressable>
        );
      })}
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
    borderRadius: radius.md,
    minHeight: 52,
    paddingVertical: spacing.xs,
  },
  itemPressed: {
    backgroundColor: colors.brand.background,
    opacity: 0.85,
  },
  itemActive: {
    backgroundColor: colors.brand.background,
  },
  label: {
    fontSize: typography.size.caption,
    color: colors.brand.secondary,
    marginTop: 2,
  },
  labelActive: {
    color: colors.brand.primary,
    fontWeight: typography.weight.bold,
  },
});
