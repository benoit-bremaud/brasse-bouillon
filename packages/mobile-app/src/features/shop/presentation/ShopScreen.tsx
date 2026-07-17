import { colors, radius, spacing, typography } from "@/core/theme";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { Badge } from "@/core/ui/Badge";
import { Card } from "@/core/ui/Card";
import { ListHeader } from "@/core/ui/ListHeader";
import { Screen } from "@/core/ui/Screen";
import { ScreenScrollView } from "@/core/ui/ScreenScrollView";
import { getErrorMessage } from "@/core/http/http-error";
import { IngredientCategorySummary } from "@/features/ingredients/domain/ingredient.types";
import { listIngredientCategoriesSummary } from "@/features/ingredients/application/ingredients.use-cases";
import {
  SHOP_RAYONS,
  ShopRayon,
  isLiveShopRayon,
} from "@/features/shop/presentation/shop.constants";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";

/**
 * Icon + label + description of a rayon tile — identical whether the tile
 * is a live link or an inert placeholder, so the two branches below differ
 * only in what they *are* (Pressable vs View), never in what they show.
 */
function RayonBody({
  rayon,
  badge,
}: Readonly<{ rayon: ShopRayon; badge: React.ReactNode }>) {
  return (
    <>
      <View style={styles.rayonIcon}>
        <Ionicons name={rayon.icon} size={24} color={colors.brand.secondary} />
      </View>

      <View style={styles.rayonInfo}>
        <View style={styles.rayonTopRow}>
          <Text style={styles.rayonLabel}>{rayon.label}</Text>
          {badge}
        </View>
        <Text style={styles.rayonDescription}>{rayon.description}</Text>
      </View>
    </>
  );
}

/**
 * Shop hub — the single door into the ingredient catalog.
 *
 * The shop owns no catalog of its own: it reads the ingredients use-cases
 * and routes into their screens. It used to mirror them with a fake
 * product list — the duplication #1444 deleted and the conception retired
 * (`equipment-shop/01-use-case.md`, § retired UC3/UC4). Hence no
 * `features/shop/data/`: a second API client here would rebuild exactly
 * what was just torn down.
 *
 * Two-speed by design: a rayon with a `catalogCategory` is live and
 * navigates; the rest are inert placeholders. Ordering is impossible
 * either way — there are no prices, and the header says so.
 */
export function ShopScreen() {
  const router = useRouter();

  const {
    data: summaries = [],
    isLoading,
    isFetching,
    error: queryError,
    refetch,
  } = useQuery<IngredientCategorySummary[]>({
    queryKey: ["ingredients", "categories-summary"],
    queryFn: listIngredientCategoriesSummary,
  });

  const error = queryError
    ? isFetching
      ? null
      : getErrorMessage(queryError, "Impossible de charger le catalogue")
    : null;
  // After a failure the query status stays `error`, so `isLoading` is false
  // during a retry while `error` is blanked above — without this the retry
  // would silently render countless rayons instead of a spinner. Same guard
  // as every sibling list screen (BatchesScreen, IngredientCategoryScreen…).
  const isRetryingWithError = isFetching && Boolean(queryError);

  const countByCategory = new Map(
    summaries.map((summary) => [summary.category, summary.count]),
  );

  const openRayon = (rayon: ShopRayon) => {
    if (!isLiveShopRayon(rayon)) {
      return;
    }
    router.push({
      pathname: "/(app)/ingredients/[category]",
      params: { category: rayon.catalogCategory },
    });
  };

  return (
    <Screen
      isLoading={(isLoading && summaries.length === 0) || isRetryingWithError}
      error={error}
      onRetry={() => {
        void refetch();
      }}
    >
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
              Parcours le catalogue et ouvre la fiche de chaque ingrédient. La
              commande en ligne, elle, arrivera plus tard.
            </Text>
          </View>
        </Card>

        <View style={styles.rayonsList}>
          {SHOP_RAYONS.map((rayon) =>
            isLiveShopRayon(rayon) ? (
              <Pressable
                key={rayon.id}
                onPress={() => openRayon(rayon)}
                accessibilityRole="button"
                accessibilityLabel={`Ouvrir le rayon ${rayon.label}`}
                style={({ pressed }) => [
                  styles.rayonRow,
                  pressed && styles.rayonRowPressed,
                ]}
              >
                <RayonBody
                  rayon={rayon}
                  badge={(() => {
                    const count = countByCategory.get(rayon.catalogCategory);
                    return count === undefined ? null : (
                      <Badge label={`${count}`} variant="info" />
                    );
                  })()}
                />
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={colors.neutral.muted}
                />
              </Pressable>
            ) : (
              // A sourceless rayon is a plain View, not a disabled Pressable:
              // it must not be focusable, and it cannot gain an onPress by
              // accident. The absence of a link is the design (04-class.md).
              <View key={rayon.id} style={styles.rayonRow}>
                <RayonBody
                  rayon={rayon}
                  badge={<Badge label="Bientôt" variant="neutral" />}
                />
              </View>
            ),
          )}
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
  rayonsList: {
    gap: spacing.sm,
  },
  rayonRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.neutral.white,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.neutral.border,
  },
  rayonRowPressed: {
    opacity: 0.7,
  },
  rayonIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.brand.background,
    justifyContent: "center",
    alignItems: "center",
  },
  rayonInfo: {
    flex: 1,
  },
  rayonTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: spacing.sm,
  },
  rayonLabel: {
    fontSize: typography.size.body,
    fontWeight: typography.weight.bold,
    color: colors.neutral.textPrimary,
  },
  rayonDescription: {
    fontSize: typography.size.label,
    color: colors.neutral.textSecondary,
    marginTop: spacing.xxs,
  },
});
