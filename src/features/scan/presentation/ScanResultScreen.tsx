import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import React, { useCallback, useMemo, useState } from "react";
import { colors, radius, spacing, typography } from "@/core/theme";

import { Card } from "@/core/ui/Card";
import { EmptyStateCard } from "@/core/ui/EmptyStateCard";
import { HeaderBackButton } from "@/core/ui/HeaderBackButton";
import { ListHeader } from "@/core/ui/ListHeader";
import { PrimaryButton } from "@/core/ui/PrimaryButton";
import type { ScanResultDetailsViewModel } from "@/features/scan/domain/scan.types";
import { Screen } from "@/core/ui/Screen";
import { getErrorMessage } from "@/core/http/http-error";
import { getScanResultDetails } from "@/features/scan/application/scan.use-cases";
import { useRouter } from "expo-router";

type ScanResultScreenProps = {
  scanIdParam?: string | string[];
};

const INITIAL_RECOMMENDATIONS_COUNT = 2;

function normalizeParam(value?: string | string[]): string {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return value ?? "";
}

function formatPercent(value: number): string {
  return `${Math.max(0, Math.min(100, Math.round(value)))}%`;
}

export function ScanResultScreen({ scanIdParam }: ScanResultScreenProps) {
  const router = useRouter();
  const [detailsViewModel, setDetailsViewModel] =
    useState<ScanResultDetailsViewModel | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showFullDetails, setShowFullDetails] = useState(false);
  const [visibleRecommendationsCount, setVisibleRecommendationsCount] =
    useState(INITIAL_RECOMMENDATIONS_COUNT);

  const scanId = normalizeParam(scanIdParam);

  const loadDetails = useCallback(async () => {
    if (!scanId) {
      setError("Missing scan result id.");
      setHasFetched(true);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const viewModel = await getScanResultDetails(scanId);
      setDetailsViewModel(viewModel);
    } catch (loadError) {
      setError(getErrorMessage(loadError, "Unable to load scan result."));
    } finally {
      setHasFetched(true);
      setIsLoading(false);
    }
  }, [scanId]);

  React.useEffect(() => {
    void loadDetails();
  }, [loadDetails]);

  const result = detailsViewModel?.result ?? null;
  const details = detailsViewModel?.details ?? null;

  const visibleRecommendations = useMemo(() => {
    return (result?.recommendations ?? []).slice(
      0,
      visibleRecommendationsCount,
    );
  }, [result?.recommendations, visibleRecommendationsCount]);

  const hasMoreRecommendations =
    (result?.recommendations.length ?? 0) > visibleRecommendationsCount;

  if (hasFetched && !isLoading && !result && !error) {
    return (
      <Screen>
        <ListHeader
          title="Scan result"
          subtitle="No matching result was found."
          action={
            <HeaderBackButton
              label="Scanner"
              accessibilityLabel="Go back to scanner"
              onPress={() => router.replace("/(app)/dashboard/scan" as never)}
            />
          }
        />
        <EmptyStateCard
          title="Result unavailable"
          description="The scanned product result could not be loaded."
          action={
            <PrimaryButton
              label="Back to scanner"
              onPress={() => router.replace("/(app)/dashboard/scan" as never)}
            />
          }
        />
      </Screen>
    );
  }

  return (
    <Screen
      isLoading={isLoading}
      error={error}
      onRetry={() => void loadDetails()}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <ListHeader
          title="Scan result"
          subtitle="Product match and recipe equivalents"
          action={
            <HeaderBackButton
              label="Scanner"
              accessibilityLabel="Go back to scanner"
              onPress={() => router.replace("/(app)/dashboard/scan" as never)}
            />
          }
        />

        {result ? (
          <Card style={styles.cardSpacing}>
            <Text style={styles.title}>{result.product.name}</Text>
            <Text style={styles.subtitle}>
              {result.product.brewery} • {result.product.style}
            </Text>
            <Text style={styles.meta}>
              Matched by {result.matchedBy} ({result.matchedValue})
            </Text>

            <View style={styles.metricsRow}>
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>ABV</Text>
                <Text style={styles.metricValue}>{result.product.abv}%</Text>
              </View>
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>IBU</Text>
                <Text style={styles.metricValue}>{result.product.ibu}</Text>
              </View>
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>EBC</Text>
                <Text style={styles.metricValue}>
                  {result.product.colorEbc}
                </Text>
              </View>
            </View>

            <PrimaryButton
              label={
                showFullDetails
                  ? "Hide product details"
                  : "Show product details"
              }
              onPress={() =>
                setShowFullDetails((previousValue) => !previousValue)
              }
            />

            {showFullDetails ? (
              details ? (
                <View style={styles.detailsBlock}>
                  <Text style={styles.detailsText}>{details.description}</Text>
                  <Text style={styles.sectionLabel}>Ingredients</Text>
                  <Text style={styles.detailsText}>
                    {details.ingredients.join(", ")}
                  </Text>
                  <Text style={styles.sectionLabel}>Tasting notes</Text>
                  <Text style={styles.detailsText}>
                    {details.tastingNotes.join(", ")}
                  </Text>
                  <Text style={styles.sectionLabel}>Serving</Text>
                  <Text style={styles.detailsText}>
                    {details.servingTemperatureCelsius}
                  </Text>
                  <Text style={styles.sectionLabel}>Food pairings</Text>
                  <Text style={styles.detailsText}>
                    {details.foodPairings.join(", ")}
                  </Text>
                </View>
              ) : (
                <Text style={styles.detailsText}>
                  No additional product details available.
                </Text>
              )
            ) : null}
          </Card>
        ) : null}

        {result ? (
          <Card>
            <Text style={styles.sectionTitle}>Similar recipes</Text>

            {visibleRecommendations.length === 0 ? (
              <Text style={styles.emptyText}>
                No equivalent recipe suggestion found.
              </Text>
            ) : (
              <View style={styles.recommendationList}>
                {visibleRecommendations.map((recommendation) => (
                  <View
                    key={recommendation.recipeId}
                    style={styles.recommendationItem}
                  >
                    <View style={styles.recommendationHeader}>
                      <Text style={styles.recommendationName}>
                        {recommendation.recipeName}
                      </Text>
                      <Text style={styles.recommendationScore}>
                        {formatPercent(recommendation.equivalencePercent)}
                      </Text>
                    </View>

                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={`Open recipe ${recommendation.recipeName}`}
                      style={styles.openRecipeButton}
                      onPress={() =>
                        router.push(`/(app)/recipes/${recommendation.recipeId}`)
                      }
                    >
                      <Text style={styles.openRecipeText}>Open recipe</Text>
                    </Pressable>
                  </View>
                ))}
              </View>
            )}

            {hasMoreRecommendations ? (
              <PrimaryButton
                label="Show more recommendations"
                onPress={() =>
                  setVisibleRecommendationsCount(
                    (currentValue) =>
                      currentValue + INITIAL_RECOMMENDATIONS_COUNT,
                  )
                }
              />
            ) : null}
          </Card>
        ) : null}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: spacing.xl,
  },
  cardSpacing: {
    marginBottom: spacing.sm,
  },
  title: {
    color: colors.neutral.textPrimary,
    fontSize: typography.size.h2,
    lineHeight: typography.lineHeight.h2,
    fontWeight: typography.weight.bold,
  },
  subtitle: {
    marginTop: spacing.xxs,
    color: colors.neutral.textSecondary,
    fontSize: typography.size.label,
    lineHeight: typography.lineHeight.label,
  },
  meta: {
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
    color: colors.neutral.muted,
    fontSize: typography.size.caption,
    lineHeight: typography.lineHeight.caption,
  },
  metricsRow: {
    flexDirection: "row",
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  metricItem: {
    flex: 1,
    backgroundColor: colors.brand.background,
    borderRadius: radius.md,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  metricLabel: {
    color: colors.neutral.textSecondary,
    fontSize: typography.size.caption,
    lineHeight: typography.lineHeight.caption,
  },
  metricValue: {
    marginTop: spacing.xxs,
    color: colors.neutral.textPrimary,
    fontSize: typography.size.label,
    lineHeight: typography.lineHeight.label,
    fontWeight: typography.weight.bold,
  },
  detailsBlock: {
    marginTop: spacing.sm,
    gap: spacing.xxs,
  },
  sectionLabel: {
    marginTop: spacing.xs,
    color: colors.neutral.textPrimary,
    fontSize: typography.size.caption,
    lineHeight: typography.lineHeight.caption,
    fontWeight: typography.weight.bold,
  },
  detailsText: {
    color: colors.neutral.textSecondary,
    fontSize: typography.size.label,
    lineHeight: typography.lineHeight.label,
  },
  sectionTitle: {
    marginBottom: spacing.sm,
    color: colors.neutral.textPrimary,
    fontSize: typography.size.body,
    lineHeight: typography.lineHeight.body,
    fontWeight: typography.weight.bold,
  },
  emptyText: {
    color: colors.neutral.textSecondary,
    fontSize: typography.size.label,
    lineHeight: typography.lineHeight.label,
  },
  recommendationList: {
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  recommendationItem: {
    borderWidth: 1,
    borderColor: colors.neutral.border,
    borderRadius: radius.md,
    padding: spacing.sm,
    gap: spacing.xs,
  },
  recommendationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: spacing.xs,
  },
  recommendationName: {
    flex: 1,
    color: colors.neutral.textPrimary,
    fontSize: typography.size.label,
    lineHeight: typography.lineHeight.label,
    fontWeight: typography.weight.medium,
  },
  recommendationScore: {
    color: colors.semantic.success,
    fontSize: typography.size.label,
    lineHeight: typography.lineHeight.label,
    fontWeight: typography.weight.bold,
  },
  openRecipeButton: {
    alignSelf: "flex-start",
    backgroundColor: colors.brand.background,
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  openRecipeText: {
    color: colors.brand.secondary,
    fontSize: typography.size.caption,
    lineHeight: typography.lineHeight.caption,
    fontWeight: typography.weight.medium,
  },
});
