import { Href, usePathname, useRouter } from "expo-router";
import { Pressable, StyleSheet, View } from "react-native";
import React, { useEffect, useState } from "react";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import { colors, spacing } from "@/core/theme";

import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export function useNavigationFooterOffset() {
  const insets = useSafeAreaInsets();
  return (insets.bottom > 0 ? insets.bottom : spacing.md) + spacing.xs + 48 + spacing.md;
}

type NavItem = {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  href: Href;
  routePrefix: string;
};

const NAV_ITEMS: NavItem[] = [
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
    label: "Boutique",
    icon: "cart-outline",
    href: "/shop",
    routePrefix: "/shop",
  },
  {
    label: "Outils",
    icon: "calculator-outline",
    href: "/tools",
    routePrefix: "/tools",
  },
  {
    label: "Académie",
    icon: "school-outline",
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

  const activeIndex = NAV_ITEMS.findIndex((item) => isFooterItemActive(pathname, item.routePrefix));
  const safeActiveIndex = activeIndex >= 0 ? activeIndex : 0;

  const [containerWidth, setContainerWidth] = useState(0);
  const itemWidth = containerWidth / NAV_ITEMS.length;

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
        setContainerWidth(e.nativeEvent.layout.width - (spacing.xs * 2));
      }}
    >
      {containerWidth > 0 && (
        <Animated.View
          style={[
            styles.activeIndicator,
            animatedIndicatorStyle,
          ]}
        />
      )}

      {NAV_ITEMS.map((item) => {
        const isActive = isFooterItemActive(pathname, item.routePrefix);

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
              color={isActive ? colors.neutral.white : colors.neutral.textPrimary}
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
