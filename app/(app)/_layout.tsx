import { colors, spacing, typography } from "@/core/theme";
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
    <View style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        <Tabs
          screenOptions={{
            headerShown: true,
            headerStyle: {
              height: 152,
            },
            tabBarStyle: { display: "none" },
            headerTitle: () => (
              <View style={styles.headerTitleContainer}>
                <BrandLogo variant="icon" size={120} />
                <Text style={styles.headerTitleText}>Brasse Bouillon</Text>
              </View>
            ),
          }}
        >
          <Tabs.Screen
            name="dashboard"
            options={{
              title: "Dashboard",
              headerShown: false,
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="home-outline" size={size} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="recipes"
            options={{
              title: "Recipes",
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
            name="equipment"
            options={{
              title: "Equipment",
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="construct-outline" size={size} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="explore"
            options={{
              title: "Explore",
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="compass-outline" size={size} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="shop"
            options={{
              href: null,
              headerShown: false,
            }}
          />
          <Tabs.Screen
            name="ingredients"
            options={{
              href: null,
            }}
          />
          <Tabs.Screen
            name="tools"
            options={{
              href: null,
            }}
          />
          <Tabs.Screen
            name="academy"
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
    fontSize: typography.size.h2,
    lineHeight: typography.lineHeight.h2,
    fontWeight: typography.weight.bold,
  },
});
