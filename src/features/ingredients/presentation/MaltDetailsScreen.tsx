import { colors, spacing, typography } from "@/core/theme";
import { StyleSheet, Text, View } from "react-native";

import { getErrorMessage } from "@/core/http/http-error";
import { normalizeRouteParam } from "@/core/navigation/route-params";
import { Card } from "@/core/ui/Card";
import { EmptyStateCard } from "@/core/ui/EmptyStateCard";
import { ListHeader } from "@/core/ui/ListHeader";
import { PrimaryButton } from "@/core/ui/PrimaryButton";
import { Screen } from "@/core/ui/Screen";
import { getMaltDetails } from "@/features/ingredients/application/malts.use-cases";
import { MaltProduct } from "@/features/ingredients/domain/malt.types";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import React from "react";

type Props = {
  maltIdParam?: string | string[];
};

function formatSpecValue(value: string, unit?: string): string {
  if (!unit) {
    return value;
  }

  return `${value} ${unit}`;
}

export function MaltDetailsScreen({ maltIdParam }: Props) {
  const router = useRouter();
  const normalizedMaltId = normalizeRouteParam(maltIdParam);

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
        <>
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

          <PrimaryButton
            label="Go back"
            onPress={() => {
              router.back();
            }}
          />
        </>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
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
});
