import React, { useCallback } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { useRouter, type Href } from "expo-router";

import { getErrorMessage } from "@/core/http/http-error";
import { colors, radius, spacing, typography } from "@/core/theme";
import { Badge } from "@/core/ui/Badge";
import { Card } from "@/core/ui/Card";
import { EmptyStateCard } from "@/core/ui/EmptyStateCard";
import { HeaderBackButton } from "@/core/ui/HeaderBackButton";
import { Screen } from "@/core/ui/Screen";
import { ScreenScrollView } from "@/core/ui/ScreenScrollView";

import {
  toBeerDetailVM,
  type BeerDetailVM,
  type TapTargetVM,
} from "@/features/beer-catalog/application/beer-catalog.view-model";
import { useBeer } from "@/features/beer-catalog/application/use-beer-catalog-details";
import { CatalogNotFoundError } from "@/features/beer-catalog/application/beer-catalog.use-cases";
import {
  ABV_LABEL,
  BACK_ACCESSIBILITY_LABEL,
  BACK_LABEL,
  BEER_NOT_FOUND,
  BREWERY_ROW_LABEL,
  COLOR_LABEL,
  DETAIL_ERROR,
  IBU_LABEL,
  LEGAL_ALCOHOL_GROUP_LABEL,
  LEGAL_ALLERGENS_LABEL,
  LEGAL_COUNTRY_LABEL,
  LEGAL_DENOMINATION_LABEL,
  SECTION_DESCRIPTION,
  SECTION_LEGAL,
  SECTION_PROVENANCE,
  STYLE_ROW_LABEL,
  VERIFIED_BADGE_LABEL,
} from "@/features/beer-catalog/presentation/beer-catalog.constants";

type Props = Readonly<{
  beerId: string;
}>;

interface LegalRow {
  label: string;
  value: string;
}

/**
 * Beer fiche (UC3) — conforms to the conception sequence
 * `mobile-catalog/04-sequence-fiche.md`: the screen paints immediately
 * from the cache-primed list row (`placeholderData`), HOLDS the
 * detail-only sections (verified badge, legal block, provenance) while
 * `isPlaceholderData` is true, maps 404 to the "bière introuvable"
 * empty state, and navigates to the brewery / style fiches through the
 * routes resolved by the view-model (`TapTargetVM`).
 */
export function BeerDetailScreen({ beerId }: Props) {
  const router = useRouter();
  const {
    data,
    isLoading,
    isError,
    error,
    isFetching,
    isPlaceholderData,
    refetch,
  } = useBeer(beerId);

  const vm = data ? toBeerDetailVM(data) : null;
  const isNotFound = error instanceof CatalogNotFoundError;
  // Surface the full-screen error only once the query has settled with
  // nothing to show — while a retry is in flight the loader takes over,
  // and a primed placeholder keeps the partial fiche on screen.
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

  const handleTapRoute = useCallback(
    (route: string) => {
      // Href cast: the `app/(app)/beer-catalog/*` route files land with
      // the routing slice; typed routes do not know them yet.
      router.push(route as Href);
    },
    [router],
  );

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
        <EmptyStateCard title={BEER_NOT_FOUND} />
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
        {vm === null ? null : (
          <BeerFiche
            vm={vm}
            showDetailSections={!isPlaceholderData}
            onNavigate={handleTapRoute}
          />
        )}
      </ScreenScrollView>
    </Screen>
  );
}

/**
 * Loaded fiche body. `showDetailSections` is false while the screen is
 * rendering the cache-primed list row (`isPlaceholderData`): the
 * verified badge, legal block and provenance are detail-only fields and
 * stay held until `GET /beers/{id}` settles (conception 04, "rendu
 * partiel immédiat").
 */
function BeerFiche({
  vm,
  showDetailSections,
  onNavigate,
}: Readonly<{
  vm: BeerDetailVM;
  showDetailSections: boolean;
  onNavigate: (route: string) => void;
}>) {
  const legalRows = buildLegalRows(vm);
  return (
    <>
      <View style={[styles.hero, { backgroundColor: vm.heroColorHex }]}>
        <Text
          style={[styles.heroTitle, { color: vm.foregroundHex }]}
          numberOfLines={2}
          accessibilityRole="header"
        >
          {vm.title}
        </Text>
        <Text
          style={[styles.heroSubtitle, { color: vm.foregroundHex }]}
          numberOfLines={1}
        >
          {`${vm.breweryName} · ${vm.styleName}`}
        </Text>
        {vm.isVerifiedBadge && showDetailSections ? (
          <Badge
            label={VERIFIED_BADGE_LABEL}
            variant="success"
            style={styles.verifiedBadge}
          />
        ) : null}
      </View>

      <Card style={styles.card}>
        <StatRow label={ABV_LABEL} value={vm.abvLabel} />
        <StatRow label={IBU_LABEL} value={vm.ibuLabel} />
        <StatRow label={COLOR_LABEL} value={vm.colorLabel} />
        <TapRow
          label={BREWERY_ROW_LABEL}
          tap={vm.breweryTap}
          fallbackValue={vm.breweryName}
          onNavigate={onNavigate}
        />
        <TapRow
          label={STYLE_ROW_LABEL}
          tap={vm.styleTap}
          fallbackValue={vm.styleName}
          onNavigate={onNavigate}
        />
      </Card>

      {vm.description === null ? null : (
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>{SECTION_DESCRIPTION}</Text>
          <Text style={styles.bodyText}>{vm.description}</Text>
        </Card>
      )}

      {showDetailSections && legalRows.length > 0 ? (
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>{SECTION_LEGAL}</Text>
          {legalRows.map((row) => (
            <StatRow key={row.label} label={row.label} value={row.value} />
          ))}
        </Card>
      ) : null}

      {showDetailSections && vm.sourceLabel !== null ? (
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>{SECTION_PROVENANCE}</Text>
          <Text style={styles.bodyText}>{vm.sourceLabel}</Text>
        </Card>
      ) : null}
    </>
  );
}

/** Legal block rows — only the fields the API actually resolved. */
function buildLegalRows(vm: BeerDetailVM): LegalRow[] {
  const candidates: Array<{ label: string; value: string | null }> = [
    { label: LEGAL_DENOMINATION_LABEL, value: vm.legal.denomination },
    { label: LEGAL_COUNTRY_LABEL, value: vm.legal.country },
    {
      label: LEGAL_ALLERGENS_LABEL,
      value:
        vm.legal.allergens.length > 0 ? vm.legal.allergens.join(", ") : null,
    },
    { label: LEGAL_ALCOHOL_GROUP_LABEL, value: vm.legal.alcoholGroupLabel },
  ];
  return candidates.filter((row): row is LegalRow => row.value !== null);
}

function StatRow({ label, value }: Readonly<{ label: string; value: string }>) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

/**
 * Brewery / style row. With a `TapTargetVM` it navigates to the
 * secondary fiche; without one (unresolved id — known API divergence)
 * it degrades to a plain, non-pressable fallback row. The callback is
 * named `onNavigate` (not `onPress`) on purpose: the fallback variant
 * must not expose any press semantics.
 */
function TapRow({
  label,
  tap,
  fallbackValue,
  onNavigate,
}: Readonly<{
  label: string;
  tap: TapTargetVM | undefined;
  fallbackValue: string;
  onNavigate: (route: string) => void;
}>) {
  if (!tap) {
    return <StatRow label={label} value={fallbackValue} />;
  }
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={tap.label}
      onPress={() => onNavigate(tap.route)}
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
    >
      <Text style={styles.rowLabel}>{label}</Text>
      <View style={styles.rowLink}>
        <Text style={styles.rowLinkText} numberOfLines={1}>
          {tap.label}
        </Text>
        <Ionicons
          name="chevron-forward"
          size={16}
          color={colors.brand.secondary}
        />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: spacing.xxl,
  },
  backRow: {
    flexDirection: "row",
    marginBottom: spacing.sm,
  },
  hero: {
    padding: spacing.lg,
    borderRadius: radius.lg,
    marginBottom: spacing.md,
  },
  heroTitle: {
    fontSize: typography.size.h1,
    lineHeight: typography.lineHeight.h1,
    fontWeight: typography.weight.bold,
  },
  heroSubtitle: {
    marginTop: spacing.xxs,
    fontSize: typography.size.label,
    lineHeight: typography.lineHeight.label,
    fontWeight: typography.weight.medium,
    opacity: 0.9,
  },
  verifiedBadge: {
    alignSelf: "flex-start",
    marginTop: spacing.sm,
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
  rowLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xxs,
    flexShrink: 1,
  },
  rowLinkText: {
    flexShrink: 1,
    fontSize: typography.size.label,
    lineHeight: typography.lineHeight.label,
    fontWeight: typography.weight.medium,
    color: colors.brand.secondary,
  },
});
