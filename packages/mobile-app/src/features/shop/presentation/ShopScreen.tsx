import { colors, radius, spacing, typography } from "@/core/theme";
import { StyleSheet, Text, View } from "react-native";
import { ScreenScrollView } from "@/core/ui/ScreenScrollView";

import { Card } from "@/core/ui/Card";
import { ListHeader } from "@/core/ui/ListHeader";
import { Screen } from "@/core/ui/Screen";
import {
  SHOP_CATEGORIES,
  shopCategoryDescriptions,
} from "@/features/shop/presentation/shop.constants";
import { Ionicons } from "@expo/vector-icons";

export function ShopScreen() {
  return (
    <Screen>
      <View style={styles.header}>
        <ListHeader
          title="Ma Boutique"
          subtitle="Tout pour brasser chez vous"
        />
      </View>

      <ScreenScrollView contentContainerStyle={styles.content}>
        <Card style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Ionicons
              name="storefront-outline"
              size={24}
              color={colors.brand.secondary}
            />
            <Text style={styles.infoText}>
              La boutique arrive bientôt : tu pourras commander tes ingrédients
              et ton matériel de brassage directement depuis l'application.
            </Text>
          </View>
        </Card>

        <Text style={styles.sectionTitle}>Bientôt en rayon</Text>

        <View style={styles.categoriesList}>
          {SHOP_CATEGORIES.map((category) => (
            <View key={category.id} style={styles.categoryRow}>
              <View style={styles.categoryIcon}>
                <Ionicons
                  name={category.icon}
                  size={24}
                  color={colors.brand.secondary}
                />
              </View>
              <View style={styles.categoryInfo}>
                <Text style={styles.categoryName}>{category.name}</Text>
                <Text style={styles.categoryDescription}>
                  {shopCategoryDescriptions[category.id]}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </ScreenScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: spacing.sm,
  },
  content: {
    paddingHorizontal: spacing.sm,
    paddingTop: spacing.sm,
  },
  infoCard: {
    backgroundColor: colors.brand.background,
    borderColor: colors.brand.secondary,
    marginBottom: spacing.md,
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
  sectionTitle: {
    fontSize: typography.size.body,
    fontWeight: typography.weight.bold,
    color: colors.neutral.textPrimary,
    marginBottom: spacing.sm,
  },
  categoriesList: {
    gap: spacing.sm,
  },
  categoryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.neutral.white,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.neutral.border,
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.brand.background,
    justifyContent: "center",
    alignItems: "center",
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: typography.size.body,
    fontWeight: typography.weight.bold,
    color: colors.neutral.textPrimary,
  },
  categoryDescription: {
    fontSize: typography.size.label,
    color: colors.neutral.textSecondary,
    marginTop: spacing.xxs,
  },
});
