import { brandHeader, colors, spacing, typography } from "@/core/theme";
import { Redirect, Tabs } from "expo-router";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import { useAuth } from "@/core/auth/auth-context";
import { BrandLogo } from "@/core/ui/BrandLogo";
import { NavigationFooter } from "@/core/ui/NavigationFooter";
import { Ionicons } from "@expo/vector-icons";

export default function AppLayout() {
  const { session, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color={colors.neutral.textPrimary} />
      </View>
    );
  }

  if (!session) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <View style={styles.root}>
      <View style={styles.tabsContainer}>
        <Tabs
          screenOptions={{
            sceneStyle: { backgroundColor: "transparent" },
            headerShown: true,
            headerTransparent: true,
            headerStyle: {
              height: brandHeader.height,
            },
            tabBarStyle: { display: "none", position: "absolute" },
            headerTitle: () => (
              <View style={styles.headerTitleContainer}>
                <BrandLogo variant="icon" size={brandHeader.logoSize} />
                <Text style={styles.headerTitleText}>Brasse Bouillon</Text>
              </View>
            ),
          }}
        >
          {/* A name here must match one of this navigator's route nodes: a
              child directory owning a _layout, or a hoisted leaf like
              "dir/index" from a _layout-less directory. Unmatched names are
              silently dropped with a [Layout children] warning (guarded by
              app-tabs-screen-names.test.ts). */}
          <Tabs.Screen
            name="recipes"
            options={{
              title: "Recettes",
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="book-outline" size={size} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="batches"
            options={{
              title: "Batches",
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="flask-outline" size={size} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="academy"
            options={{
              href: null,
            }}
          />
          <Tabs.Screen
            name="beer-catalog"
            options={{
              href: null,
            }}
          />
        </Tabs>
      </View>
      <NavigationFooter />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  tabsContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.state.infoBackground,
  },
  headerTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  headerTitleText: {
    color: colors.brand.secondary,
    fontSize: typography.size.body,
    lineHeight: typography.lineHeight.body,
    fontWeight: typography.weight.bold,
  },
});
