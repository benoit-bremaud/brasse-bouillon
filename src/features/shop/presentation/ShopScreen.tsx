import { colors, radius, spacing, typography } from "@/core/theme";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { Card } from "@/core/ui/Card";
import { Screen } from "@/core/ui/Screen";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { shopCategories } from "../domain/shop.types";

export function ShopScreen() {
  const router = useRouter();

  return (
    <Screen>
      <View style={styles.headerRow}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backArrow}>←</Text>
        </Pressable>
        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>Boutique</Text>
          <Text style={styles.headerSubtitle}>Tout pour brasser chez vous</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>Catégories</Text>

        <View style={styles.categoriesGrid}>
          {shopCategories.map((category) => (
            <View key={category.id} style={styles.categoryCard}>
              <View style={styles.categoryIcon}>
                <Ionicons
                  name={category.icon as keyof typeof Ionicons.glyphMap}
                  size={32}
                  color={colors.brand.secondary}
                />
              </View>
              <Text style={styles.categoryName}>{category.name}</Text>
            </View>
          ))}
        </View>

        <Card style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Ionicons
              name="information-circle"
              size={24}
              color={colors.brand.secondary}
            />
            <Text style={styles.infoText}>
              Bientôt disponible : commande en ligne de tous vos ingrédients et
              équipements de brassage !
            </Text>
          </View>
        </Card>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.border,
    backgroundColor: colors.neutral.white,
  },
  backButton: {
    padding: spacing.xs,
    marginRight: spacing.sm,
  },
  backArrow: {
    fontSize: 20,
    color: colors.brand.secondary,
    fontWeight: typography.weight.bold,
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: typography.size.h2,
    fontWeight: typography.weight.bold,
    color: colors.neutral.textPrimary,
  },
  headerSubtitle: {
    fontSize: typography.size.caption,
    color: colors.neutral.textSecondary,
  },
  content: {
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.sm,
    paddingTop: spacing.sm,
  },
  sectionTitle: {
    fontSize: typography.size.body,
    fontWeight: typography.weight.bold,
    color: colors.neutral.textPrimary,
    marginBottom: spacing.sm,
  },
  categoriesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  categoryCard: {
    width: "47%",
    backgroundColor: colors.neutral.white,
    borderRadius: radius.lg,
    padding: spacing.md,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.neutral.border,
  },
  categoryIcon: {
    width: 64,
    height: 64,
    borderRadius: radius.lg,
    backgroundColor: colors.brand.background,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  categoryName: {
    fontSize: typography.size.label,
    fontWeight: typography.weight.medium,
    color: colors.neutral.textPrimary,
    textAlign: "center",
  },
  infoCard: {
    backgroundColor: colors.brand.background,
    borderColor: colors.brand.secondary,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
  },
  infoText: {
    flex: 1,
    fontSize: typography.size.label,
    color: colors.neutral.textSecondary,
    lineHeight: typography.lineHeight.label,
  },
});
