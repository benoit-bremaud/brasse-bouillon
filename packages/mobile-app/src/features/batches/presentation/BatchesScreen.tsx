import {
  BatchStatus,
  BatchSummary,
} from "@/features/batches/domain/batch.types";
import {
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { colors, radius, spacing, typography } from "@/core/theme";

import { BATCH_STATUS_LABELS } from "@/features/batches/presentation/batch-display.constants";
import { Badge } from "@/core/ui/Badge";
import { Card } from "@/core/ui/Card";
import { EmptyStateCard } from "@/core/ui/EmptyStateCard";
import { Ionicons } from "@expo/vector-icons";
import { ListHeader } from "@/core/ui/ListHeader";
import { PrimaryButton } from "@/core/ui/PrimaryButton";
import React from "react";
import { Screen } from "@/core/ui/Screen";
import { ScreenFlatList } from "@/core/ui/ScreenFlatList";
import { dataSource } from "@/core/data/data-source";
import { demoRecipes } from "@/mocks/demo-data";
import { getErrorMessage } from "@/core/http/http-error";
import { getSrmColor } from "@/features/tools/data/catalogs/srm";
import { listBatches } from "@/features/batches/application/batches.use-cases";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";

const DEFAULT_BATCH_COLOR_EBC = 10;

const getRecipeColorEbc = (recipeId: string): number => {
  if (!dataSource.useDemoData) {
    return DEFAULT_BATCH_COLOR_EBC;
  }

  const recipe = demoRecipes.find((r) => r.id === recipeId);
  return recipe?.stats?.colorEbc ?? DEFAULT_BATCH_COLOR_EBC;
};

const getRecipeName = (recipeId: string, batchId: string): string => {
  if (dataSource.useDemoData) {
    const recipe = demoRecipes.find((r) => r.id === recipeId);
    if (recipe) {
      return recipe.name;
    }
  }

  // Live mode does not bundle the recipe with the batch summary, so we
  // fall back to the brassin identifier in French until listBatches is
  // extended to return the recipe name alongside the batch.
  return `Brassin ${batchId.slice(0, 8)}`;
};

const getStatusLabel = (status: BatchStatus): string => {
  return BATCH_STATUS_LABELS[status] ?? status;
};

const getStatusVariant = (status: BatchStatus): "success" | "info" => {
  if (status === "completed") return "success";
  return "info";
};

export function BatchesScreen() {
  const router = useRouter();
  const {
    data: batches = [],
    isLoading,
    isFetching,
    isFetched,
    error: queryError,
    refetch,
  } = useQuery<BatchSummary[]>({
    queryKey: ["batches", "list"],
    queryFn: listBatches,
  });

  // Active « Mes brassins »: soft states (cancelled/archived) are hidden from
  // the list without deleting their journal (brew-day/07 — F16/F25).
  const activeBatches = batches.filter(
    (batch) => batch.status !== "cancelled" && batch.status !== "archived",
  );

  const error = queryError
    ? isFetching
      ? null
      : getErrorMessage(queryError, "Failed to load batches")
    : null;
  const showEmptyState = isFetched && !isLoading && activeBatches.length === 0;
  const isRetryingWithError = isFetching && Boolean(queryError);

  const handleRefetch = () => {
    void refetch();
  };

  return (
    <Screen
      isLoading={
        (isLoading && activeBatches.length === 0) || isRetryingWithError
      }
      error={error}
      onRetry={handleRefetch}
    >
      <ListHeader title="Mes Brassins" subtitle="Suivi de tes brassins" />

      {showEmptyState ? (
        <EmptyStateCard
          title="Aucun batch"
          description="Lance un batch depuis une recette."
          action={<PrimaryButton label="Recharger" onPress={handleRefetch} />}
        />
      ) : null}

      <ScreenFlatList
        data={activeBatches}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={isFetching} onRefresh={handleRefetch} />
        }
        renderItem={({ item }) => {
          const ebc = getRecipeColorEbc(item.recipeId);
          const srm = ebc * 0.508;
          const beerColor = getSrmColor(srm);

          return (
            <Pressable
              onPress={() => {
                // An « en préparation » draft resumes its prep screen — it
                // has no brewing journal to open yet (brew-day/07, F15).
                if (item.status === "draft") {
                  router.push(`/(app)/recipes/${item.recipeId}/prepare`);
                  return;
                }
                // Demo mode: a finished brassin opens the celebration
                // mockup ("La Première du dimanche est prête à
                // déguster") instead of the technical details view.
                // Live mode keeps the canonical details navigation —
                // the hardcoded celebration content would otherwise
                // misrepresent a real user's batch.
                if (item.status === "completed" && dataSource.useDemoData) {
                  router.push("/(app)/batches/celebration");
                  return;
                }
                router.push(`/(app)/batches/${item.id}`);
              }}
            >
              <Card style={styles.card}>
                <Badge
                  label={getStatusLabel(item.status)}
                  variant={getStatusVariant(item.status)}
                  placement="corner"
                />
                <View style={styles.cardContent}>
                  <View
                    style={[styles.beerIcon, { backgroundColor: beerColor }]}
                  >
                    <Ionicons
                      name="beer"
                      size={24}
                      color={colors.neutral.white}
                    />
                  </View>
                  <View style={styles.cardInfo}>
                    <Text style={styles.cardTitle} numberOfLines={1}>
                      {getRecipeName(item.recipeId, item.id)}
                    </Text>
                  </View>
                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color={colors.neutral.muted}
                  />
                </View>
              </Card>
            </Pressable>
          );
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: {
    paddingHorizontal: spacing.sm,
  },
  card: {
    marginBottom: spacing.sm,
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  beerIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.lg,
    justifyContent: "center",
    alignItems: "center",
  },
  cardInfo: {
    flex: 1,
    paddingTop: spacing.sm,
  },
  cardTitle: {
    fontSize: typography.size.body,
    lineHeight: typography.lineHeight.body,
    fontWeight: typography.weight.bold,
    color: colors.neutral.textPrimary,
  },
});
