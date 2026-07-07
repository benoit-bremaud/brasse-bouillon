import { Href, usePathname, useRouter } from "expo-router";
import { Pressable, StyleSheet, View } from "react-native";
import React, { useEffect, useState } from "react";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { colors, spacing } from "@/core/theme";

import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export function useNavigationFooterOffset() {
  const insets = useSafeAreaInsets();
  return (
    (insets.bottom > 0 ? insets.bottom : spacing.md) +
    spacing.xs +
    48 +
    spacing.md
  );
}

type NavItem = {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  href: Href;
  routePrefix: string;
};

// Issue #613 — bottom tab bar redesign promotes Scan + Profil to
// permanent slots in place of Boutique + Outils. The order matches
// the v0.1.0-beta1 audit decision: Accueil · Brassins · Recettes ·
// Scan ⭐ · Académie · Profil. Boutique and Outils remain reachable
// from the dashboard "Voir plus" sheet.
const BASE_NAV_ITEMS: NavItem[] = [
  {
    label: "Accueil",
    icon: "home-outline",
    href: "/dashboard",
    routePrefix: "/dashboard",
  },
  {
    label: "Brassins",
    icon: "flask-outline",
    href: "/batches",
    routePrefix: "/batches",
  },
  {
    label: "Recettes",
    icon: "book-outline",
    href: "/recipes",
    routePrefix: "/recipes",
  },
  {
    label: "Scan",
    icon: "barcode-outline",
    href: "/dashboard/scan",
    routePrefix: "/dashboard/scan",
  },
  {
    label: "Académie",
    icon: "school-outline",
    href: "/academy",
    routePrefix: "/academy",
  },
  {
    label: "Profil",
    icon: "person-circle-outline",
    href: "/profile",
    routePrefix: "/profile",
  },
];

function isFooterItemActive(pathname: string, routePrefix: string): boolean {
  return pathname === routePrefix || pathname.startsWith(`${routePrefix}/`);
}

// Longest-prefix-match for the active tab. Without this, on
// pathname `/dashboard/scan`, both Accueil (prefix `/dashboard`)
// and Scan (prefix `/dashboard/scan`) would match — and the naive
// `findIndex` would return Accueil because it is declared first.
// Picking the most specific prefix avoids that collision while
// keeping the items in their visual order. Issue #613.
function findActiveNavIndex(pathname: string, items: NavItem[]): number {
  let bestIndex = -1;
  let bestLength = -1;
  for (let index = 0; index < items.length; index += 1) {
    const item = items[index];
    if (
      isFooterItemActive(pathname, item.routePrefix) &&
      item.routePrefix.length > bestLength
    ) {
      bestIndex = index;
      bestLength = item.routePrefix.length;
    }
  }
  return bestIndex;
}

export function NavigationFooter() {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  // Same dock in demo and live — the nav must not diverge between modes.
  const navItems = BASE_NAV_ITEMS;

  const activeIndex = findActiveNavIndex(pathname, navItems);
  const hasActiveItem = activeIndex >= 0;
  const safeActiveIndex = hasActiveItem ? activeIndex : 0;

  const [containerWidth, setContainerWidth] = useState(0);
  const itemWidth = containerWidth / navItems.length;

  const translateX = useSharedValue(0);

  useEffect(() => {
    if (itemWidth > 0) {
      translateX.value = withSpring(safeActiveIndex * itemWidth, {
        mass: 1,
        damping: 15,
        stiffness: 120,
      });
    }
  }, [safeActiveIndex, itemWidth, translateX]);

  const animatedIndicatorStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
      width: itemWidth,
    };
  });

  return (
    <View
      style={[
        styles.container,
        {
          bottom: (insets.bottom > 0 ? insets.bottom : spacing.md) + spacing.xs,
        },
      ]}
      onLayout={(e) => {
        // We calculate available width by removing padding horizontally
        setContainerWidth(e.nativeEvent.layout.width - spacing.xs * 2);
      }}
    >
      {containerWidth > 0 && hasActiveItem && (
        <Animated.View
          style={[styles.activeIndicator, animatedIndicatorStyle]}
        />
      )}

      {navItems.map((item, index) => {
        // Use the longest-prefix-match `activeIndex` rather than the
        // raw `isFooterItemActive` here so the per-item visual + a11y
        // state stays consistent with the animated indicator. Without
        // this, on /dashboard/scan both Accueil (prefix /dashboard)
        // and Scan would advertise `selected: true`. Issue #613.
        const isActive = activeIndex === index;

        return (
          <Pressable
            key={item.href as string}
            style={({ pressed }) => [
              styles.item,
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
              color={
                isActive ? colors.neutral.white : colors.neutral.textPrimary
              }
            />
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: spacing.lg,
    right: spacing.lg,
    flexDirection: "row",
    backgroundColor: colors.neutral.white,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xs,
    shadowColor: colors.neutral.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  item: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 100,
    minHeight: 48,
    zIndex: 2, // ensure icon is above the animated background
  },
  itemPressed: {
    opacity: 0.7,
  },
  activeIndicator: {
    position: "absolute",
    height: 48,
    top: spacing.xs,
    left: spacing.xs,
    borderRadius: 100,
    backgroundColor: colors.semantic.success,
    zIndex: 1,
  },
});
