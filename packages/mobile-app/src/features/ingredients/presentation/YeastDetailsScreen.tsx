import { colors, spacing, typography } from "@/core/theme";
import {
  getYeastDetails,
  listAlternativeYeasts,
} from "@/features/ingredients/application/yeasts.use-cases";
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
import { YeastProduct } from "@/features/ingredients/domain/yeast.types";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import React from "react";

type Props = {
  yeastIdParam?: string | string[];
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

function getYeastAttenuationValue(yeast: YeastProduct): string | null {
  for (const group of yeast.specGroups) {
    for (const row of group.rows) {
      const normalizedLabel = row.label.toLocaleLowerCase();
      const normalizedUnit = row.unit?.toLocaleLowerCase();

      if (!normalizedLabel.includes("attenuation")) {
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

function getAlternativeYeastMeta(yeast: YeastProduct): string {
  const attenuation = getYeastAttenuationValue(yeast);
  const typeLabel = yeast.yeastType ?? "Unknown";
  const attenuationLabel = attenuation ?? "N/A";

  return `Type: ${typeLabel} • Attenuation: ${attenuationLabel}${attenuation ? "%" : ""}`;
}

export function YeastDetailsScreen({
  yeastIdParam,
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
  const normalizedYeastId = normalizeRouteParam(yeastIdParam);
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
    data: yeast = null,
    isLoading,
    isFetching,
    isFetched,
    error: queryError,
    refetch,
  } = useQuery<YeastProduct | null>({
    queryKey: ["ingredients", "yeasts", "details", normalizedYeastId],
    queryFn: () => {
      if (!normalizedYeastId) {
        return Promise.resolve(null);
      }

      return getYeastDetails(normalizedYeastId);
    },
    enabled: Boolean(normalizedYeastId),
  });

  const { data: alternativeYeasts = [] } = useQuery<YeastProduct[]>({
    queryKey: [
      "ingredients",
      "yeasts",
      "details",
      "alternatives",
      normalizedYeastId,
    ],
    queryFn: () => {
      if (!normalizedYeastId) {
        return Promise.resolve([]);
      }

      return listAlternativeYeasts(normalizedYeastId, 3);
    },
    enabled: Boolean(normalizedYeastId),
  });

  const openAlternativeYeast = (alternativeId: string) => {
    router.push({
      pathname: "/(app)/ingredients/[category]/[id]",
      params: {
        category: "yeasts",
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
      : getErrorMessage(queryError, "Unable to load yeast sheet")
    : null;

  if (!normalizedYeastId) {
    return (
      <Screen>
        <EmptyStateCard
          title="Unavailable yeast sheet"
          description="Navigation parameters are incomplete."
        />
      </Screen>
    );
  }

  if (isFetched && !isLoading && !yeast && !error) {
    return (
      <Screen>
        <EmptyStateCard
          title="Yeast not found"
          description="This yeast product does not exist in the current data source."
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
      {yeast ? (
        <ScrollView
          testID="yeast-details-scroll"
          style={styles.scroll}
          contentContainerStyle={styles.content}
        >
          <ListHeader
            title={yeast.name}
            subtitle={yeast.brand ?? "Yeast product sheet"}
          />

          <Card style={styles.identityCard}>
            {yeast.yeastType ? (
              <Text style={styles.identityText}>Type: {yeast.yeastType}</Text>
            ) : null}
            {yeast.originCountry ? (
              <Text style={styles.identityText}>
                Origin: {yeast.originCountry}
              </Text>
            ) : null}
            {yeast.description ? (
              <Text style={styles.description}>{yeast.description}</Text>
            ) : null}
          </Card>

          {yeast.specGroups.map((group) => (
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

          {alternativeYeasts.length > 0 ? (
            <Card style={styles.groupCard}>
              <Text style={styles.groupTitle}>Alternative yeasts</Text>

              {alternativeYeasts.map((alternative) => (
                <Pressable
                  key={alternative.id}
                  style={styles.alternativeRow}
                  accessibilityRole="button"
                  accessibilityLabel={`View alternative yeast ${alternative.name}`}
                  onPress={() => {
                    openAlternativeYeast(alternative.id);
                  }}
                >
                  <View style={styles.alternativeContent}>
                    <Text style={styles.alternativeName}>
                      {alternative.name}
                    </Text>
                    <Text style={styles.alternativeMeta}>
                      {getAlternativeYeastMeta(alternative)}
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
