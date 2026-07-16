import React, { useCallback } from "react";
import { Linking, Pressable, StyleSheet, Text, View } from "react-native";

import { useRouter } from "expo-router";

import { getErrorMessage } from "@/core/http/http-error";
import { colors, spacing, typography } from "@/core/theme";
import { Card } from "@/core/ui/Card";
import { EmptyStateCard } from "@/core/ui/EmptyStateCard";
import { HeaderBackButton } from "@/core/ui/HeaderBackButton";
import { ListHeader } from "@/core/ui/ListHeader";
import { ScreenScrollView } from "@/core/ui/ScreenScrollView";
import { Screen } from "@/core/ui/Screen";

import {
  toBreweryFicheVM,
  type BreweryFicheVM,
} from "@/features/beer-catalog/application/beer-catalog.view-model";
import { useBrewery } from "@/features/beer-catalog/application/use-beer-catalog-details";
import { CatalogNotFoundError } from "@/features/beer-catalog/application/beer-catalog.use-cases";
import {
  BACK_ACCESSIBILITY_LABEL,
  BACK_LABEL,
  BREWERY_LOCATION_LABEL,
  BREWERY_NOT_FOUND,
  BREWERY_TYPE_LABEL,
  BREWERY_WEBSITE_LABEL,
  DETAIL_ERROR,
  SECTION_DESCRIPTION,
} from "@/features/beer-catalog/presentation/beer-catalog.constants";

type Props = Readonly<{
  breweryId: string;
}>;

interface FicheRowData {
  label: string;
  value: string;
}

/**
 * Brewery fiche — secondary screen reached by tapping the brewery row
 * on the beer fiche (conception `mobile-catalog/04-sequence-fiche.md`,
 * view-model `BreweryFicheVM` in `10-class-view-model.md`). Null rows
 * are skipped; 404 maps to the "brasserie introuvable" empty state.
 */
export function BreweryDetailScreen({ breweryId }: Props) {
  const router = useRouter();
  const { data, isLoading, isError, error, isFetching, refetch } =
    useBrewery(breweryId);

  const vm = data ? toBreweryFicheVM(data) : null;
  const isNotFound = error instanceof CatalogNotFoundError;
  // Full-screen error only once the query settled with nothing to show.
  const screenError =
    isError && !isNotFound && !isFetching && !vm
      ? getErrorMessage(error, DETAIL_ERROR)
      : null;

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  const handleRetry = useCallback(() => {
    void refetch();
  }, [refetch]);

  if (isNotFound) {
    return (
      <Screen>
        <View style={styles.backRow}>
          <HeaderBackButton
            label={BACK_LABEL}
            accessibilityLabel={BACK_ACCESSIBILITY_LABEL}
            onPress={handleBack}
          />
        </View>
        <EmptyStateCard title={BREWERY_NOT_FOUND} />
      </Screen>
    );
  }

  return (
    <Screen
      isLoading={isLoading && !vm}
      error={screenError}
      onRetry={handleRetry}
    >
      <ScreenScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.backRow}>
          <HeaderBackButton
            label={BACK_LABEL}
            accessibilityLabel={BACK_ACCESSIBILITY_LABEL}
            onPress={handleBack}
          />
        </View>
        {vm === null ? null : <BreweryFiche vm={vm} />}
      </ScreenScrollView>
    </Screen>
  );
}

/** Loaded fiche body — null fields are skipped, never rendered empty. */
function BreweryFiche({ vm }: Readonly<{ vm: BreweryFicheVM }>) {
  const ficheRows = buildFicheRows(vm);
  const { foundedLabel, website } = vm;
  const hasFicheCard =
    ficheRows.length > 0 || foundedLabel !== null || website !== null;
  return (
    <>
      <ListHeader title={vm.title} />
      {hasFicheCard ? (
        <Card style={styles.card}>
          {ficheRows.map((row) => (
            <FicheRow key={row.label} label={row.label} value={row.value} />
          ))}
          {foundedLabel === null ? null : (
            <Text style={styles.founded}>{foundedLabel}</Text>
          )}
          {website === null ? null : (
            <Pressable
              accessibilityRole="link"
              accessibilityLabel={BREWERY_WEBSITE_LABEL}
              onPress={() => void Linking.openURL(website)}
              style={({ pressed }) => [
                styles.row,
                pressed && styles.rowPressed,
              ]}
            >
              <Text style={styles.rowLabel}>{BREWERY_WEBSITE_LABEL}</Text>
              <Text style={styles.rowLinkText} numberOfLines={1}>
                {website}
              </Text>
            </Pressable>
          )}
        </Card>
      ) : null}
      {vm.description === null ? null : (
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>{SECTION_DESCRIPTION}</Text>
          <Text style={styles.bodyText}>{vm.description}</Text>
        </Card>
      )}
    </>
  );
}

function buildFicheRows(vm: BreweryFicheVM): FicheRowData[] {
  const candidates: Array<{ label: string; value: string | null }> = [
    { label: BREWERY_TYPE_LABEL, value: vm.typeLabel },
    { label: BREWERY_LOCATION_LABEL, value: vm.locationLabel },
  ];
  return candidates.filter((row): row is FicheRowData => row.value !== null);
}

function FicheRow({
  label,
  value,
}: Readonly<{ label: string; value: string }>) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContent: {},
  backRow: {
    flexDirection: "row",
    marginBottom: spacing.sm,
  },
  card: {
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.size.body,
    lineHeight: typography.lineHeight.body,
    fontWeight: typography.weight.bold,
    color: colors.neutral.textPrimary,
    marginBottom: spacing.xs,
  },
  bodyText: {
    fontSize: typography.size.label,
    lineHeight: typography.lineHeight.label,
    fontWeight: typography.weight.regular,
    color: colors.neutral.textPrimary,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.border,
  },
  rowPressed: {
    opacity: 0.7,
  },
  rowLabel: {
    fontSize: typography.size.label,
    lineHeight: typography.lineHeight.label,
    color: colors.neutral.textSecondary,
    paddingRight: spacing.sm,
  },
  rowValue: {
    flexShrink: 1,
    fontSize: typography.size.label,
    lineHeight: typography.lineHeight.label,
    fontWeight: typography.weight.medium,
    color: colors.neutral.textPrimary,
    textAlign: "right",
  },
  rowLinkText: {
    flexShrink: 1,
    fontSize: typography.size.label,
    lineHeight: typography.lineHeight.label,
    fontWeight: typography.weight.medium,
    color: colors.brand.secondary,
  },
  founded: {
    paddingVertical: spacing.xs,
    fontSize: typography.size.label,
    lineHeight: typography.lineHeight.label,
    fontWeight: typography.weight.medium,
    color: colors.neutral.textPrimary,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.border,
  },
});
