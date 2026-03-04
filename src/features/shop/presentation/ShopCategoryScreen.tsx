import { FlatList, StyleSheet, Text, View } from "react-native";
import { colors, radius, spacing, typography } from "@/core/theme";
import {
  isShopCategory,
  mockShopProducts,
  shopCategoryDescriptions,
  shopCategoryLabels,
} from "@/features/shop/presentation/shop.constants";

import { Badge } from "@/core/ui/Badge";
import { Card } from "@/core/ui/Card";
import { EmptyStateCard } from "@/core/ui/EmptyStateCard";
import { HeaderBackButton } from "@/core/ui/HeaderBackButton";
import { Ionicons } from "@expo/vector-icons";
import { ListHeader } from "@/core/ui/ListHeader";
import { PrimaryButton } from "@/core/ui/PrimaryButton";
import React from "react";
import { Screen } from "@/core/ui/Screen";
import { normalizeRouteParam } from "@/core/navigation/route-params";
import { useRouter } from "expo-router";

type Props = {
  categoryParam?: string | string[];
};

export function ShopCategoryScreen({ categoryParam }: Props) {
  const router = useRouter();
  const category = normalizeRouteParam(categoryParam) ?? "";
  const isValid = isShopCategory(category);

  const handleGoToShop = () => {
    router.replace("/shop");
  };

  if (!isValid) {
    return (
      <Screen>
        <ListHeader
          title="Catégorie inconnue"
          subtitle="Cette catégorie n'existe pas"
          action={
            <HeaderBackButton
              label="Boutique"
              accessibilityLabel="Retour à la boutique"
              onPress={handleGoToShop}
            />
          }
        />
        <EmptyStateCard
          title="Catégorie invalide"
          description="La catégorie de boutique demandée n'existe pas."
          action={
            <PrimaryButton
              label="Retour à la boutique"
              onPress={handleGoToShop}
            />
          }
        />
      </Screen>
    );
  }

  const label = shopCategoryLabels[category];
  const description = shopCategoryDescriptions[category];
  const mockProducts = mockShopProducts[category];

  return (
    <Screen>
      <ListHeader
        title={label}
        subtitle={description}
        action={
          <HeaderBackButton
            label="Boutique"
            accessibilityLabel="Retour à la boutique"
            onPress={handleGoToShop}
          />
        }
      />

      <FlatList
        data={mockProducts}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <Card style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Ionicons
                name="information-circle"
                size={24}
                color={colors.brand.secondary}
              />
              <Text style={styles.infoText}>
                Bientôt disponible : commande en ligne de {label.toLowerCase()}{" "}
                !
              </Text>
            </View>
          </Card>
        }
        ListHeaderComponentStyle={styles.listHeader}
        renderItem={({ item }) => (
          <Card style={styles.productCard}>
            <View style={styles.productRow}>
              <View style={styles.productIcon}>
                <Ionicons
                  name="cube-outline"
                  size={24}
                  color={colors.brand.secondary}
                />
              </View>
              <View style={styles.productInfo}>
                <Text style={styles.productName}>{item.name}</Text>
                <Text style={styles.productDesc}>{item.description}</Text>
                <View style={styles.productMeta}>
                  <Text style={styles.productPrice}>
                    ~{item.price.toFixed(2)} €/kg
                  </Text>
                  <Badge label="À venir" variant="info" />
                </View>
              </View>
            </View>
          </Card>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: {
    paddingBottom: spacing.md,
  },
  listHeader: {
    marginBottom: spacing.sm,
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
  productCard: {
    marginBottom: spacing.sm,
  },
  productRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  productIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.brand.background,
    justifyContent: "center",
    alignItems: "center",
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: typography.size.body,
    fontWeight: typography.weight.bold,
    color: colors.neutral.textPrimary,
  },
  productDesc: {
    fontSize: typography.size.label,
    color: colors.neutral.textSecondary,
    marginTop: spacing.xxs,
  },
  productMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  productPrice: {
    fontSize: typography.size.label,
    fontWeight: typography.weight.medium,
    color: colors.brand.secondary,
  },
});
