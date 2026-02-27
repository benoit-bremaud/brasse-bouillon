import { colors, spacing, typography } from "@/core/theme";
import {
  getMaltDetails,
  listAlternativeMalts,
} from "@/features/ingredients/application/malts.use-cases";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { getErrorMessage } from "@/core/http/http-error";
import { normalizeRouteParam } from "@/core/navigation/route-params";
import { Card } from "@/core/ui/Card";
import { EmptyStateCard } from "@/core/ui/EmptyStateCard";
import { ListHeader } from "@/core/ui/ListHeader";
import { PrimaryButton } from "@/core/ui/PrimaryButton";
import { Screen } from "@/core/ui/Screen";
import { MaltProduct } from "@/features/ingredients/domain/malt.types";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import React from "react";

type Props = {
  maltIdParam?: string | string[];
  returnToParam?: string | string[];
  returnRecipeIdParam?: string | string[];
  returnCategoryParam?: string | string[];
  returnSearchParam?: string | string[];
  returnEbcMinParam?: string | string[];
  returnEbcMaxParam?: string | string[];
};

function formatSpecValue(value: string, unit?: string): string {
  if (!unit) {
    return value;
  }

  return `${value} ${unit}`;
}

function getMaltColorEbcValue(malt: MaltProduct): string | null {
  for (const group of malt.specGroups) {
    for (const row of group.rows) {
      const normalizedLabel = row.label.toLocaleLowerCase();
      const normalizedUnit = row.unit?.toLocaleLowerCase();

      if (!normalizedLabel.includes("color")) {
        continue;
      }

      if (normalizedUnit && normalizedUnit !== "ebc") {
        continue;
      }

      return row.value;
    }
  }

  return null;
}

function getAlternativeMaltMeta(malt: MaltProduct): string {
  const colorEbc = getMaltColorEbcValue(malt);
  const typeLabel = malt.maltType ?? "Unknown";
  const colorLabel = colorEbc ?? "N/A";

  return `Type: ${typeLabel} • EBC: ${colorLabel}`;
}

export function MaltDetailsScreen({
  maltIdParam,
  returnToParam,
  returnRecipeIdParam,
  returnCategoryParam,
  returnSearchParam,
  returnEbcMinParam,
  returnEbcMaxParam,
}: Props) {
  const router = useRouter();
  const normalizedMaltId = normalizeRouteParam(maltIdParam);
  const normalizedReturnTo = normalizeRouteParam(returnToParam);
  const normalizedReturnRecipeId = normalizeRouteParam(returnRecipeIdParam);
  const normalizedReturnCategory = normalizeRouteParam(returnCategoryParam);
  const normalizedReturnSearch = normalizeRouteParam(returnSearchParam);
  const normalizedReturnEbcMin = normalizeRouteParam(returnEbcMinParam);
  const normalizedReturnEbcMax = normalizeRouteParam(returnEbcMaxParam);

  const buildMaltCategoryReturnParams = (): Record<string, string> | null => {
    if (!normalizedReturnCategory) {
      return null;
    }

    const params: Record<string, string> = {
      category: normalizedReturnCategory,
    };

    if (normalizedReturnSearch) {
      params.search = normalizedReturnSearch;
    }

    if (normalizedReturnEbcMin) {
      params.ebcMin = normalizedReturnEbcMin;
    }

    if (normalizedReturnEbcMax) {
      params.ebcMax = normalizedReturnEbcMax;
    }

    return params;
  };

  const buildMaltDetailsReturnContextParams = (
    alternativeId: string,
  ): Record<string, string> => {
    const params: Record<string, string> = {
      id: alternativeId,
    };

    if (normalizedReturnTo) {
      params.returnTo = normalizedReturnTo;
    }

    if (normalizedReturnRecipeId) {
      params.returnRecipeId = normalizedReturnRecipeId;
    }

    if (normalizedReturnCategory) {
      params.returnCategory = normalizedReturnCategory;
    }

    if (normalizedReturnSearch) {
      params.returnSearch = normalizedReturnSearch;
    }

    if (normalizedReturnEbcMin) {
      params.returnEbcMin = normalizedReturnEbcMin;
    }

    if (normalizedReturnEbcMax) {
      params.returnEbcMax = normalizedReturnEbcMax;
    }

    return params;
  };

  const handleGoBack = () => {
    if (normalizedReturnTo && normalizedReturnRecipeId) {
      router.push({
        pathname: normalizedReturnTo as never,
        params: { id: normalizedReturnRecipeId } as never,
      });
      return;
    }

    if (normalizedReturnTo) {
      const maltCategoryReturnParams = buildMaltCategoryReturnParams();

      if (maltCategoryReturnParams) {
        router.push({
          pathname: normalizedReturnTo as never,
          params: maltCategoryReturnParams as never,
        });
        return;
      }
    }

    if (normalizedReturnTo) {
      router.push(normalizedReturnTo as never);
      return;
    }

    router.push("/(app)/ingredients");
  };

  const {
    data: malt = null,
    isLoading,
    isFetching,
    isFetched,
    error: queryError,
    refetch,
  } = useQuery<MaltProduct | null>({
    queryKey: ["ingredients", "malts", "details", normalizedMaltId],
    queryFn: () => {
      if (!normalizedMaltId) {
        return Promise.resolve(null);
      }

      return getMaltDetails(normalizedMaltId);
    },
    enabled: Boolean(normalizedMaltId),
  });

  const { data: alternativeMalts = [] } = useQuery<MaltProduct[]>({
    queryKey: [
      "ingredients",
      "malts",
      "details",
      "alternatives",
      normalizedMaltId,
    ],
    queryFn: () => {
      if (!normalizedMaltId) {
        return Promise.resolve([]);
      }

      return listAlternativeMalts(normalizedMaltId, 3);
    },
    enabled: Boolean(normalizedMaltId),
  });

  const openAlternativeMalt = (alternativeId: string) => {
    router.push({
      pathname: "/(app)/ingredients/malts/[id]",
      params: buildMaltDetailsReturnContextParams(alternativeId) as never,
    });
  };

  const error = queryError
    ? isFetching
      ? null
      : getErrorMessage(queryError, "Unable to load malt sheet")
    : null;

  if (!normalizedMaltId) {
    return (
      <Screen>
        <EmptyStateCard
          title="Unavailable malt sheet"
          description="Navigation parameters are incomplete."
        />
      </Screen>
    );
  }

  if (isFetched && !isLoading && !malt && !error) {
    return (
      <Screen>
        <EmptyStateCard
          title="Malt not found"
          description="This malt product does not exist in the current data source."
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
      {malt ? (
        <ScrollView
          testID="malt-details-scroll"
          style={styles.scroll}
          contentContainerStyle={styles.content}
        >
          <ListHeader
            title={malt.name}
            subtitle={malt.brand ?? "Malt product sheet"}
          />

          <Card style={styles.identityCard}>
            {malt.maltType ? (
              <Text style={styles.identityText}>Type: {malt.maltType}</Text>
            ) : null}
            {malt.originCountry ? (
              <Text style={styles.identityText}>
                Origin: {malt.originCountry}
              </Text>
            ) : null}
            {malt.description ? (
              <Text style={styles.description}>{malt.description}</Text>
            ) : null}
          </Card>

          {malt.specGroups.map((group) => (
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

          {alternativeMalts.length > 0 ? (
            <Card style={styles.groupCard}>
              <Text style={styles.groupTitle}>Alternative malts</Text>

              {alternativeMalts.map((alternative) => (
                <Pressable
                  key={alternative.id}
                  style={styles.alternativeRow}
                  accessibilityRole="button"
                  accessibilityLabel={`View alternative malt ${alternative.name}`}
                  onPress={() => {
                    openAlternativeMalt(alternative.id);
                  }}
                >
                  <View style={styles.alternativeContent}>
                    <Text style={styles.alternativeName}>
                      {alternative.name}
                    </Text>
                    <Text style={styles.alternativeMeta}>
                      {getAlternativeMaltMeta(alternative)}
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
