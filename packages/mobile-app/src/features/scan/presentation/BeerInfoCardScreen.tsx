import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { colors, radius, spacing, typography } from "@/core/theme";
import { Card } from "@/core/ui/Card";
import { HeaderBackButton } from "@/core/ui/HeaderBackButton";
import { ListHeader } from "@/core/ui/ListHeader";
import { Screen } from "@/core/ui/Screen";

import {
  ScanLookupBeerNotFoundError,
  ScanLookupInvalidBarcodeError,
  ScanLookupServiceUnavailableError,
  lookupBeerByBarcode,
} from "@/features/scan/application/scan-lookup.use-cases";
import {
  abvToStrengthWord,
  ebcToColorWord,
  ibuToBitternessWord,
} from "@/features/scan/application/lookup-formatters";
import type {
  ScanLookupResult,
  ScanRecipeMatch,
} from "@/features/scan/domain/scan.types";
import { BeerHero } from "@/features/scan/presentation/components/BeerHero";
import { Collapsible } from "@/features/scan/presentation/components/Collapsible";
import {
  getDemoBreweryStory,
  getDemoEquivalentRecipes,
} from "@/mocks/demo-data";

import { useRouter } from "expo-router";

type BeerInfoCardScreenProps = {
  barcodeParam?: string | string[];
};

type ScreenStatus =
  | { kind: "loading" }
  | { kind: "ready"; result: ScanLookupResult }
  | { kind: "error"; message: string; canRetry: boolean };

const ERROR_NOT_FOUND =
  "Cette bière n'est pas dans notre catalogue. Essaie une autre bouteille ou contribue à enrichir la base.";
const ERROR_UNAVAILABLE =
  "Le service de reconnaissance est temporairement indisponible. Réessaie dans quelques instants.";
const ERROR_INVALID =
  "Ce code-barres n'est pas reconnu (8 à 14 chiffres attendus). Vérifie ce que tu as scanné.";
const ERROR_GENERIC = "Impossible de récupérer cette bière pour le moment.";

function resolveBarcodeParam(barcodeParam?: string | string[]): string | null {
  if (!barcodeParam) return null;
  return Array.isArray(barcodeParam) ? barcodeParam[0] : barcodeParam;
}

function mapErrorToStatus(error: unknown): ScreenStatus {
  if (error instanceof ScanLookupBeerNotFoundError) {
    return { kind: "error", message: ERROR_NOT_FOUND, canRetry: false };
  }
  if (error instanceof ScanLookupServiceUnavailableError) {
    return { kind: "error", message: ERROR_UNAVAILABLE, canRetry: true };
  }
  if (error instanceof ScanLookupInvalidBarcodeError) {
    return { kind: "error", message: ERROR_INVALID, canRetry: false };
  }
  return { kind: "error", message: ERROR_GENERIC, canRetry: true };
}

/**
 * "Beer recognised" info card — the screen the user (and the jury)
 * lands on after a successful barcode scan. Layered per the
 * brainstorm §2 + #698 acceptance criteria:
 *
 *   1. Hero (EBC-driven background)
 *   2. At-a-glance — name, brewery, ABV %, then style / colour /
 *      bitterness in WORDS (persona Léa la Curieuse)
 *   3. "🧪 Recettes équivalentes" — top 3 community recipes from
 *      the matching backend (#699). Today the data comes from the
 *      curated demo set; tomorrow same shape from API.
 *   4. "▾ Détails techniques" — lazy-loaded fold (raw ABV, IBU,
 *      EBC, fermentation, aromatic tags, source attribution,
 *      estimate flags).
 *   5. "▾ Histoire de la brasserie" — lazy-loaded fold (curated
 *      stories for the demo beers, "Histoire à venir" otherwise).
 *
 * Fold contents follow the GoF Lazy Initialization pattern called
 * out by #698: `Collapsible.renderContent` is only invoked on
 * first open, so heavy children don't pay their cost on initial
 * render.
 */
export function BeerInfoCardScreen({ barcodeParam }: BeerInfoCardScreenProps) {
  const router = useRouter();
  const barcode = resolveBarcodeParam(barcodeParam);

  const [status, setStatus] = useState<ScreenStatus>({ kind: "loading" });

  const fetch = useCallback(async () => {
    if (!barcode) {
      setStatus({
        kind: "error",
        message: ERROR_INVALID,
        canRetry: false,
      });
      return;
    }
    setStatus({ kind: "loading" });
    try {
      const result = await lookupBeerByBarcode(barcode);
      setStatus({ kind: "ready", result });
    } catch (error) {
      setStatus(mapErrorToStatus(error));
    }
  }, [barcode]);

  useEffect(() => {
    void fetch();
  }, [fetch]);

  const handleBack = useCallback(() => {
    router.replace("/(app)/dashboard/scan" as never);
  }, [router]);

  if (status.kind === "loading") {
    return <Screen isLoading>{null}</Screen>;
  }

  if (status.kind === "error") {
    return (
      <Screen
        error={status.message}
        onRetry={status.canRetry ? fetch : undefined}
      >
        <ListHeader
          title="Résultat du scan"
          action={
            <HeaderBackButton
              label="Scan"
              accessibilityLabel="Retour au scan"
              onPress={handleBack}
            />
          }
        />
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <ListHeader
          title="Bière reconnue"
          subtitle={subtitleForSource(status.result.source)}
          action={
            <HeaderBackButton
              label="Scan"
              accessibilityLabel="Retour au scan"
              onPress={handleBack}
            />
          }
        />

        <BeerHero
          name={status.result.item.name}
          brewery={status.result.item.brewery}
          style={status.result.item.style}
          colorEbc={status.result.item.colorEbc}
        />

        <AtAGlance result={status.result} />

        <EquivalentRecipesSection
          barcode={status.result.item.barcode}
          onPickRecipe={(recipeId) =>
            router.push(`/(app)/recipes/${recipeId}` as never)
          }
        />

        <Collapsible
          title="Détails techniques"
          renderContent={() => <TechnicalDetails result={status.result} />}
        />

        <Collapsible
          title="Histoire de la brasserie"
          renderContent={() => (
            <BreweryStory brewery={status.result.item.brewery} />
          )}
        />
      </ScrollView>
    </Screen>
  );
}

function subtitleForSource(source: ScanLookupResult["source"]): string {
  switch (source) {
    case "cache_hit_fresh":
      return "Données fraîches";
    case "cache_hit_stale":
      return "Données mises en cache";
    case "cache_miss_fetched":
      return "Récupéré en direct";
  }
}

function AtAGlance({ result }: { result: ScanLookupResult }) {
  const { item } = result;
  const abvLabel = item.abv != null ? `${item.abv.toFixed(1)} %` : "—";
  const colorWord = ebcToColorWord(item.colorEbc);
  const bitternessWord = ibuToBitternessWord(item.ibu);
  const strengthWord = abvToStrengthWord(item.abv);

  return (
    <Card style={styles.glanceCard}>
      <Text style={styles.glanceAbv}>{abvLabel}</Text>
      <Text style={styles.glanceStrength}>{strengthWord}</Text>
      <View style={styles.glanceRow}>
        <GlanceCell label="Style" value={item.style || "Inconnu"} />
        <GlanceCell label="Couleur" value={colorWord} />
        <GlanceCell label="Amertume" value={bitternessWord} />
      </View>
    </Card>
  );
}

function GlanceCell({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.glanceCell}>
      <Text style={styles.glanceCellLabel}>{label}</Text>
      <Text
        style={styles.glanceCellValue}
        numberOfLines={3}
        adjustsFontSizeToFit
        minimumFontScale={0.85}
      >
        {value}
      </Text>
    </View>
  );
}

function EquivalentRecipesSection({
  barcode,
  onPickRecipe,
}: {
  barcode: string;
  onPickRecipe: (recipeId: string) => void;
}) {
  const recipes = useMemo<ReadonlyArray<ScanRecipeMatch>>(
    () => getDemoEquivalentRecipes(barcode),
    [barcode],
  );

  if (recipes.length === 0) {
    return null;
  }

  return (
    <Card style={styles.recipesCard}>
      <Text style={styles.recipesTitle}>🧪 Recettes équivalentes</Text>
      <Text style={styles.recipesSubtitle}>
        Notées par la communauté Brasse Bouillon
      </Text>
      {recipes.map((recipe) => (
        <Pressable
          key={recipe.recipeId}
          onPress={() => onPickRecipe(recipe.recipeId)}
          style={({ pressed }) => [
            styles.recipeRow,
            pressed ? styles.recipeRowPressed : null,
          ]}
          accessibilityRole="button"
          accessibilityLabel={`${recipe.name} par ${recipe.brewer}, noté ${recipe.rating} sur 5`}
        >
          <View style={styles.recipeRowLeft}>
            <Text style={styles.recipeName} numberOfLines={2}>
              {recipe.name}
            </Text>
            <Text style={styles.recipeBrewer}>
              {recipe.brewer} · brassée {recipe.brewedCount} fois
            </Text>
          </View>
          <View style={styles.recipeRowRight}>
            <Text style={styles.recipeRating}>
              ★ {recipe.rating.toFixed(1)}
            </Text>
          </View>
        </Pressable>
      ))}
    </Card>
  );
}

function TechnicalDetails({ result }: { result: ScanLookupResult }) {
  const { item } = result;
  const rows: Array<{ label: string; value: string; estimated?: boolean }> = [];

  if (item.abv != null) {
    rows.push({
      label: "Alcool",
      value: `${item.abv.toFixed(1)} %`,
      estimated: item.isAbvEstimated,
    });
  }
  if (item.ibu != null) {
    rows.push({
      label: "Amertume (IBU)",
      value: String(item.ibu),
      estimated: item.isIbuEstimated,
    });
  }
  if (item.colorEbc != null) {
    rows.push({
      label: "Couleur (EBC)",
      value: String(item.colorEbc),
      estimated: item.isColorEbcEstimated,
    });
  }
  if (item.fermentationType) {
    rows.push({
      label: "Fermentation",
      value: item.fermentationType,
    });
  }
  if (item.aromaticTags) {
    rows.push({ label: "Notes aromatiques", value: item.aromaticTags });
  }
  if (item.notesSource) {
    rows.push({ label: "Source", value: item.notesSource });
  }

  if (rows.length === 0) {
    return (
      <Text style={styles.emptyFold}>
        Aucun détail technique disponible pour cette bière.
      </Text>
    );
  }

  return (
    <View>
      {rows.map((row) => (
        <View key={row.label} style={styles.techRow}>
          <Text style={styles.techLabel}>{row.label}</Text>
          <View style={styles.techValueWrap}>
            <Text style={styles.techValue}>{row.value}</Text>
            {row.estimated ? (
              <Text style={styles.techEstimated}>· estimé</Text>
            ) : null}
          </View>
        </View>
      ))}
    </View>
  );
}

function BreweryStory({ brewery }: { brewery: string }) {
  const story = getDemoBreweryStory(brewery);
  if (!story) {
    return (
      <Text style={styles.emptyFold}>
        Histoire à venir — la fiche de cette brasserie n'est pas encore rédigée.
      </Text>
    );
  }
  return <Text style={styles.storyText}>{story}</Text>;
}

// Issue #736 — extracted constant so TS accepts the cast and SonarCloud
// doesn't see a runtime branch (no Platform.OS check). Native silently
// ignores `wordBreak` / `overflowWrap`; RN-web honors them.
const WEB_TEXT_WRAP_STYLE = {
  wordBreak: "keep-all",
  overflowWrap: "break-word",
};

const styles = StyleSheet.create({
  scrollContent: {
    // Issue #737 — paddingBottom must clear the bottom tab bar (~80px)
    // plus a comfortable gap. Without this the last fold ('Histoire de
    // la brasserie') gets partially hidden when fully scrolled.
    paddingBottom: spacing.xxl * 3,
  },
  glanceCard: {
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  glanceAbv: {
    fontSize: typography.size.h2,
    fontWeight: typography.weight.bold,
    color: colors.brand.primary,
  },
  glanceStrength: {
    fontSize: typography.size.label,
    fontWeight: typography.weight.medium,
    color: colors.neutral.textSecondary,
    marginBottom: spacing.sm,
  },
  glanceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  glanceCell: {
    flex: 1,
    backgroundColor: colors.brand.background,
    borderRadius: radius.md,
    padding: spacing.sm,
  },
  glanceCellLabel: {
    fontSize: typography.size.caption,
    fontWeight: typography.weight.medium,
    color: colors.neutral.textSecondary,
    textTransform: "uppercase",
    marginBottom: spacing.xxs,
    letterSpacing: 0.5,
  },
  glanceCellValue: {
    fontSize: typography.size.body,
    fontWeight: typography.weight.medium,
    color: colors.neutral.textPrimary,
    // Issue #736 — RN core types don't expose `wordBreak`/`overflowWrap`
    // but RN-web honors them at runtime, breaking long French words
    // ("Légèrement amère") on a space rather than mid-word. Native
    // silently ignores unknown style keys, so the spread is safe on
    // every platform without a Platform.OS branch.
    ...(WEB_TEXT_WRAP_STYLE as object),
  },
  recipesCard: {
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  recipesTitle: {
    fontSize: typography.size.body,
    fontWeight: typography.weight.bold,
    color: colors.neutral.textPrimary,
    marginBottom: spacing.xxs,
  },
  recipesSubtitle: {
    fontSize: typography.size.caption,
    color: colors.neutral.textSecondary,
    marginBottom: spacing.sm,
  },
  recipeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.border,
  },
  recipeRowPressed: {
    opacity: 0.85,
  },
  recipeRowLeft: {
    flex: 1,
    paddingRight: spacing.sm,
  },
  recipeRowRight: {
    alignItems: "flex-end",
  },
  recipeName: {
    fontSize: typography.size.body,
    fontWeight: typography.weight.medium,
    color: colors.neutral.textPrimary,
    marginBottom: spacing.xxs,
  },
  recipeBrewer: {
    fontSize: typography.size.caption,
    color: colors.neutral.textSecondary,
  },
  recipeRating: {
    fontSize: typography.size.label,
    fontWeight: typography.weight.bold,
    color: colors.brand.primary,
  },
  techRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.border,
  },
  techLabel: {
    fontSize: typography.size.label,
    color: colors.neutral.textSecondary,
  },
  techValueWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xxs,
  },
  techValue: {
    fontSize: typography.size.label,
    fontWeight: typography.weight.medium,
    color: colors.neutral.textPrimary,
  },
  techEstimated: {
    fontSize: typography.size.caption,
    color: colors.neutral.textSecondary,
    fontStyle: "italic",
  },
  storyText: {
    fontSize: typography.size.body,
    lineHeight: typography.lineHeight.body,
    color: colors.neutral.textPrimary,
  },
  emptyFold: {
    fontSize: typography.size.label,
    color: colors.neutral.textSecondary,
    fontStyle: "italic",
  },
});
