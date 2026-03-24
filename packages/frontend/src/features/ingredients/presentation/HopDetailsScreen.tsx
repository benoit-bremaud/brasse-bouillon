import { colors, spacing, typography } from "@/core/theme";
import {
  getHopDetails,
  listAlternativeHops,
} from "@/features/ingredients/application/hops.use-cases";
import {
  buildIngredientCategoryBackNavigationParams,
  buildIngredientDetailsReturnParams,
  buildRecipeBackNavigationTarget,
  normalizeIngredientReturnContextParams,
} from "@/features/ingredients/presentation/ingredient-navigation-context";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { getErrorMessage } from "@/core/http/http-error";
import { normalizeRouteParam } from "@/core/navigation/route-params";
import { Card } from "@/core/ui/Card";
import { EmptyStateCard } from "@/core/ui/EmptyStateCard";
import { ListHeader } from "@/core/ui/ListHeader";
import { PrimaryButton } from "@/core/ui/PrimaryButton";
import { Screen } from "@/core/ui/Screen";
import { HopProduct } from "@/features/ingredients/domain/hop.types";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import React from "react";

type Props = {
  hopIdParam?: string | string[];
  returnToParam?: string | string[];
  returnRecipeIdParam?: string | string[];
  returnCategoryParam?: string | string[];
  returnSearchParam?: string | string[];
  returnEbcMinParam?: string | string[];
  returnEbcMaxParam?: string | string[];
  returnAlphaMinParam?: string | string[];
  returnAttenuationMinParam?: string | string[];
};

function formatSpecValue(value: string, unit?: string): string {
  if (!unit) {
    return value;
  }

  return `${value} ${unit}`;
}

function getHopAlphaAcidValue(hop: HopProduct): string | null {
  for (const group of hop.specGroups) {
    for (const row of group.rows) {
      const normalizedLabel = row.label.toLocaleLowerCase();
      const normalizedUnit = row.unit?.toLocaleLowerCase();

      if (!normalizedLabel.includes("alpha")) {
        continue;
      }

      if (normalizedUnit && !normalizedUnit.includes("%")) {
        continue;
      }

      return row.value;
    }
  }

  return null;
}

function getAlternativeHopMeta(hop: HopProduct): string {
  const alphaAcid = getHopAlphaAcidValue(hop);
  const typeLabel = hop.hopType ?? "Unknown";
  const alphaLabel = alphaAcid ?? "N/A";

  return `Type: ${typeLabel} • Alpha: ${alphaLabel}${alphaAcid ? "%" : ""}`;
}

export function HopDetailsScreen({
  hopIdParam,
  returnToParam,
  returnRecipeIdParam,
  returnCategoryParam,
  returnSearchParam,
  returnEbcMinParam,
  returnEbcMaxParam,
  returnAlphaMinParam,
  returnAttenuationMinParam,
}: Props) {
  const router = useRouter();
  const normalizedHopId = normalizeRouteParam(hopIdParam);
  const normalizedReturnContext = normalizeIngredientReturnContextParams({
    returnToParam,
    returnRecipeIdParam,
    returnCategoryParam,
    returnSearchParam,
    returnEbcMinParam,
    returnEbcMaxParam,
    returnAlphaMinParam,
    returnAttenuationMinParam,
  });

  const handleGoBack = () => {
    const recipeBackNavigationTarget = buildRecipeBackNavigationTarget(
      normalizedReturnContext,
    );

    if (recipeBackNavigationTarget) {
      router.push(recipeBackNavigationTarget as never);
      return;
    }

    const ingredientCategoryBackNavigationTarget =
      buildIngredientCategoryBackNavigationParams(normalizedReturnContext);

    if (ingredientCategoryBackNavigationTarget) {
      router.push(ingredientCategoryBackNavigationTarget as never);
      return;
    }

    if (normalizedReturnContext.returnTo) {
      router.push(normalizedReturnContext.returnTo as never);
      return;
    }

    router.push("/(app)/ingredients");
  };

  const {
    data: hop = null,
    isLoading,
    isFetching,
    isFetched,
    error: queryError,
    refetch,
  } = useQuery<HopProduct | null>({
    queryKey: ["ingredients", "hops", "details", normalizedHopId],
    queryFn: () => {
      if (!normalizedHopId) {
        return Promise.resolve(null);
      }

      return getHopDetails(normalizedHopId);
    },
    enabled: Boolean(normalizedHopId),
  });

  const { data: alternativeHops = [] } = useQuery<HopProduct[]>({
    queryKey: [
      "ingredients",
      "hops",
      "details",
      "alternatives",
      normalizedHopId,
    ],
    queryFn: () => {
      if (!normalizedHopId) {
        return Promise.resolve([]);
      }

      return listAlternativeHops(normalizedHopId, 3);
    },
    enabled: Boolean(normalizedHopId),
  });

  const openAlternativeHop = (alternativeId: string) => {
    router.push({
      pathname: "/(app)/ingredients/[category]/[id]",
      params: {
        category: "hops",
        id: alternativeId,
        ...buildIngredientDetailsReturnParams(
          alternativeId,
          normalizedReturnContext,
        ),
      } as never,
    });
  };

  const error = queryError
    ? isFetching
      ? null
      : getErrorMessage(queryError, "Unable to load hop sheet")
    : null;

  if (!normalizedHopId) {
    return (
      <Screen>
        <EmptyStateCard
          title="Unavailable hop sheet"
          description="Navigation parameters are incomplete."
        />
      </Screen>
    );
  }

  if (isFetched && !isLoading && !hop && !error) {
    return (
      <Screen>
        <EmptyStateCard
          title="Hop not found"
          description="This hop product does not exist in the current data source."
        />
      </Screen>
    );
  }

  return (
    <Screen
      isLoading={isLoading || (isFetching && Boolean(queryError))}
      error={error}
      onRetry={() => {
        void refetch();
      }}
    >
      {hop ? (
        <ScrollView
          testID="hop-details-scroll"
          style={styles.scroll}
          contentContainerStyle={styles.content}
        >
          <ListHeader
            title={hop.name}
            subtitle={hop.brand ?? "Hop product sheet"}
          />

          <Card style={styles.identityCard}>
            {hop.hopType ? (
              <Text style={styles.identityText}>Type: {hop.hopType}</Text>
            ) : null}
            {hop.originCountry ? (
              <Text style={styles.identityText}>
                Origin: {hop.originCountry}
              </Text>
            ) : null}
            {hop.description ? (
              <Text style={styles.description}>{hop.description}</Text>
            ) : null}
          </Card>

          {hop.specGroups.map((group) => (
            <Card key={group.id} style={styles.groupCard}>
              <Text style={styles.groupTitle}>{group.title}</Text>

              {group.rows.map((row) => (
                <View key={row.id} style={styles.row}>
                  <Text style={styles.rowLabel}>{row.label}</Text>
                  <Text style={styles.rowValue}>
                    {formatSpecValue(row.value, row.unit)}
                  </Text>
                </View>
              ))}
            </Card>
          ))}

          {alternativeHops.length > 0 ? (
            <Card style={styles.groupCard}>
              <Text style={styles.groupTitle}>Alternative hops</Text>

              {alternativeHops.map((alternative) => (
                <Pressable
                  key={alternative.id}
                  style={styles.alternativeRow}
                  accessibilityRole="button"
                  accessibilityLabel={`View alternative hop ${alternative.name}`}
                  onPress={() => {
                    openAlternativeHop(alternative.id);
                  }}
                >
                  <View style={styles.alternativeContent}>
                    <Text style={styles.alternativeName}>
                      {alternative.name}
                    </Text>
                    <Text style={styles.alternativeMeta}>
                      {getAlternativeHopMeta(alternative)}
                    </Text>
                  </View>
                </Pressable>
              ))}
            </Card>
          ) : null}

          <PrimaryButton label="Go back" onPress={handleGoBack} />
        </ScrollView>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  content: {
    paddingBottom: spacing.lg,
  },
  identityCard: {
    marginBottom: spacing.sm,
  },
  identityText: {
    color: colors.neutral.textSecondary,
    fontSize: typography.size.label,
    lineHeight: typography.lineHeight.label,
    marginBottom: spacing.xxs,
  },
  description: {
    marginTop: spacing.xs,
    color: colors.neutral.textPrimary,
    fontSize: typography.size.label,
    lineHeight: typography.lineHeight.label,
  },
  groupCard: {
    marginBottom: spacing.sm,
  },
  groupTitle: {
    color: colors.neutral.textPrimary,
    fontWeight: typography.weight.bold,
    fontSize: typography.size.body,
    lineHeight: typography.lineHeight.body,
    marginBottom: spacing.xs,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.xs,
  },
  rowLabel: {
    flex: 1,
    color: colors.neutral.textSecondary,
    fontSize: typography.size.label,
    lineHeight: typography.lineHeight.label,
    marginRight: spacing.xs,
  },
  rowValue: {
    color: colors.neutral.textPrimary,
    fontWeight: typography.weight.medium,
    fontSize: typography.size.label,
    lineHeight: typography.lineHeight.label,
  },
  alternativeRow: {
    paddingVertical: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.neutral.border,
  },
  alternativeContent: {
    gap: spacing.xxs,
  },
  alternativeName: {
    color: colors.neutral.textPrimary,
    fontSize: typography.size.label,
    lineHeight: typography.lineHeight.label,
    fontWeight: typography.weight.medium,
  },
  alternativeMeta: {
    color: colors.neutral.textSecondary,
    fontSize: typography.size.caption,
    lineHeight: typography.lineHeight.caption,
  },
});
