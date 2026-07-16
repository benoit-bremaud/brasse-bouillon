import React, { useCallback } from "react";
import { StyleSheet, Text, View } from "react-native";

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
  toStyleFicheVM,
  type StyleFicheVM,
} from "@/features/beer-catalog/application/beer-catalog.view-model";
import { useStyle } from "@/features/beer-catalog/application/use-beer-catalog-details";
import { CatalogNotFoundError } from "@/features/beer-catalog/application/beer-catalog.use-cases";
import {
  BACK_ACCESSIBILITY_LABEL,
  BACK_LABEL,
  DETAIL_ERROR,
  STYLE_ABV_RANGE_LABEL,
  STYLE_CATEGORY_LABEL,
  STYLE_COLOR_RANGE_LABEL,
  STYLE_FAMILY_LABEL,
  STYLE_IBU_RANGE_LABEL,
  STYLE_NOT_FOUND,
} from "@/features/beer-catalog/presentation/beer-catalog.constants";

type Props = Readonly<{
  styleId: string;
}>;

interface FicheRowData {
  label: string;
  value: string;
}

/**
 * Style fiche — secondary screen reached by tapping the style row on
 * the beer fiche (conception `mobile-catalog/04-sequence-fiche.md`,
 * view-model `StyleFicheVM` in `10-class-view-model.md`). Null ranges
 * are skipped; 404 maps to the "style introuvable" empty state.
 */
export function StyleDetailScreen({ styleId }: Props) {
  const router = useRouter();
  const { data, isLoading, isError, error, isFetching, refetch } =
    useStyle(styleId);

  const vm = data ? toStyleFicheVM(data) : null;
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
        <EmptyStateCard title={STYLE_NOT_FOUND} />
      </Screen>
    );
  }

  const ficheRows = vm === null ? [] : buildFicheRows(vm);

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
        {vm === null ? null : (
          <>
            <ListHeader title={vm.title} />
            {ficheRows.length > 0 ? (
              <Card style={styles.card}>
                {ficheRows.map((row) => (
                  <FicheRow
                    key={row.label}
                    label={row.label}
                    value={row.value}
                  />
                ))}
              </Card>
            ) : null}
          </>
        )}
      </ScreenScrollView>
    </Screen>
  );
}

function buildFicheRows(vm: StyleFicheVM): FicheRowData[] {
  const candidates: Array<{ label: string; value: string | null }> = [
    { label: STYLE_CATEGORY_LABEL, value: vm.categoryLabel },
    { label: STYLE_FAMILY_LABEL, value: vm.familyLabel },
    { label: STYLE_ABV_RANGE_LABEL, value: vm.abvRangeLabel },
    { label: STYLE_IBU_RANGE_LABEL, value: vm.ibuRangeLabel },
    { label: STYLE_COLOR_RANGE_LABEL, value: vm.colorRangeLabel },
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
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.border,
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
});
