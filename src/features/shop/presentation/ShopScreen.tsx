import { colors, radius, spacing, typography } from "@/core/theme";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { Card } from "@/core/ui/Card";
import { ListHeader } from "@/core/ui/ListHeader";
import { Screen } from "@/core/ui/Screen";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { shopCategories } from "../domain/shop.types";

export function ShopScreen() {
  const router = useRouter();

  return (
    <Screen>
      <View style={styles.header}>
        <ListHeader
          title="Ma Boutique"
          subtitle="Tout pour brasser chez vous"
        />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>Catégories</Text>

        <View style={styles.categoriesGrid}>
          {shopCategories.map((category) => (
            <Pressable
              key={category.id}
              onPress={() =>
                router.push({
                  pathname: "/(app)/shop/[category]",
                  params: { category: category.id },
                })
              }
              style={({ pressed }) => [
                styles.categoryCard,
                pressed && styles.categoryCardPressed,
              ]}
              accessibilityLabel={`Ouvrir la catégorie ${category.name}`}
              accessibilityRole="button"
            >
              <View style={styles.categoryIcon}>
                <Ionicons
                  name={category.icon as keyof typeof Ionicons.glyphMap}
                  size={32}
                  color={colors.brand.secondary}
                />
              </View>
              <Text style={styles.categoryName}>{category.name}</Text>
            </Pressable>
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
  header: {
    paddingHorizontal: spacing.sm,
    paddingTop: spacing.sm,
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
    width: "31%",
    backgroundColor: colors.neutral.white,
    borderRadius: radius.lg,
    padding: spacing.md,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.neutral.border,
  },
  categoryCardPressed: {
    opacity: 0.7,
  },
  categoryIcon: {
    width: 56,
    height: 56,
    borderRadius: radius.lg,
    backgroundColor: colors.brand.background,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  categoryName: {
    fontSize: typography.size.caption,
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
