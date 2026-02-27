import { colors, radius, spacing, typography } from "@/core/theme";
import {
  BatchStatus,
  BatchSummary,
} from "@/features/batches/domain/batch.types";
import {
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { dataSource } from "@/core/data/data-source";
import { getErrorMessage } from "@/core/http/http-error";
import { Badge } from "@/core/ui/Badge";
import { Card } from "@/core/ui/Card";
import { EmptyStateCard } from "@/core/ui/EmptyStateCard";
import { ListHeader } from "@/core/ui/ListHeader";
import { PrimaryButton } from "@/core/ui/PrimaryButton";
import { Screen } from "@/core/ui/Screen";
import { listBatches } from "@/features/batches/application/batches.use-cases";
import { getSrmColor } from "@/features/tools/data/catalogs/srm";
import { demoRecipes } from "@/mocks/demo-data";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import React from "react";

const DEFAULT_BATCH_COLOR_EBC = 10;

const getRecipeColorEbc = (recipeId: string): number => {
  if (!dataSource.useDemoData) {
    return DEFAULT_BATCH_COLOR_EBC;
  }

  const recipe = demoRecipes.find((r) => r.id === recipeId);
  return recipe?.stats?.colorEbc ?? DEFAULT_BATCH_COLOR_EBC;
};

const getStatusLabel = (status: BatchStatus): string => {
  const labels: Record<BatchStatus, string> = {
    in_progress: "In Progress",
    completed: "Done",
  };
  return labels[status] ?? status;
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

  const error = queryError
    ? isFetching
      ? null
      : getErrorMessage(queryError, "Failed to load batches")
    : null;
  const showEmptyState = isFetched && !isLoading && batches.length === 0;
  const isRetryingWithError = isFetching && Boolean(queryError);

  const handleRefetch = () => {
    void refetch();
  };

  return (
    <Screen
      isLoading={(isLoading && batches.length === 0) || isRetryingWithError}
      error={error}
      onRetry={handleRefetch}
    >
      <View style={styles.header}>
        <ListHeader title="Mes Brassins" subtitle="Suivi de tes brassins" />
        <Pressable
          onPress={() => router.push("/(app)/academy")}
          style={styles.academyButton}
        >
          <Ionicons
            name="school-outline"
            size={18}
            color={colors.brand.secondary}
          />
          <Text style={styles.academyText}>Academy</Text>
        </Pressable>
      </View>

      {showEmptyState ? (
        <EmptyStateCard
          title="Aucun batch"
          description="Lance un batch depuis une recette."
          action={<PrimaryButton label="Recharger" onPress={handleRefetch} />}
        />
      ) : null}

      <FlatList
        data={batches}
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
            <Pressable onPress={() => router.push(`/(app)/batches/${item.id}`)}>
              <Card style={styles.card}>
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
                    <View style={styles.cardTopRow}>
                      <Text style={styles.cardTitle}>
                        Batch {item.id.slice(0, 8)}
                      </Text>
                      <Badge
                        label={getStatusLabel(item.status)}
                        variant={getStatusVariant(item.status)}
                      />
                    </View>
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.sm,
    paddingBottom: spacing.sm,
  },
  academyButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xxs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.lg,
    backgroundColor: colors.brand.background,
    borderWidth: 1,
    borderColor: colors.brand.secondary,
  },
  academyText: {
    color: colors.brand.secondary,
    fontSize: typography.size.caption,
    fontWeight: typography.weight.medium,
  },
  list: {
    paddingBottom: spacing.md,
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
  },
  cardTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardTitle: {
    fontSize: typography.size.body,
    lineHeight: typography.lineHeight.body,
    fontWeight: typography.weight.bold,
    color: colors.neutral.textPrimary,
  },
});
