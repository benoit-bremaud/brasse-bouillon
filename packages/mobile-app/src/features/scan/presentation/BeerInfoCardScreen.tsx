import React, { useCallback, useMemo } from "react";
import {
  Alert,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { colors, radius, spacing, typography } from "@/core/theme";
import { Card } from "@/core/ui/Card";
import { HeaderBackButton } from "@/core/ui/HeaderBackButton";
import { ListHeader } from "@/core/ui/ListHeader";
import { Screen } from "@/core/ui/Screen";

import {
  getImportSourceId,
  importRecipeFromCommunity,
} from "@/features/recipes/application/recipes.use-cases";
import { getMatchingRecipes } from "@/features/scan/application/recipe-matching.use-cases";
import {
  ScanLookupBeerNotFoundError,
  ScanLookupInvalidBarcodeError,
  ScanLookupNotABeerError,
  ScanLookupServiceUnavailableError,
  lookupBeerByBarcode,
} from "@/features/scan/application/scan-lookup.use-cases";
import {
  abvToStrengthWord,
  ebcToColorWord,
  ibuToBitternessWord,
} from "@/features/scan/application/lookup-formatters";
import type {
  ScanCatalogItem,
  ScanLookupResult,
  ScanRecipeMatch,
} from "@/features/scan/domain/scan.types";
import { BeerHero } from "@/features/scan/presentation/components/BeerHero";
import { Collapsible } from "@/features/scan/presentation/components/Collapsible";
import { getDemoBreweryStory } from "@/mocks/demo-data";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";

type BeerInfoCardScreenProps = {
  barcodeParam?: string | string[];
};

type ErrorVariant =
  | "not_found"
  | "not_a_beer"
  | "unavailable"
  | "invalid"
  | "generic";

type ScreenStatus =
  | { kind: "loading" }
  | { kind: "ready"; result: ScanLookupResult }
  | {
      kind: "error";
      variant: ErrorVariant;
      message: string;
      canRetry: boolean;
      barcode?: string;
      productName?: string | null;
    };

const ERROR_NOT_FOUND =
  "Cette bière n'est pas dans notre catalogue. Essaie une autre bouteille ou contribue à enrichir la base.";
const ERROR_UNAVAILABLE =
  "Le service de reconnaissance est temporairement indisponible. Réessaie dans quelques instants.";
const ERROR_INVALID =
  "Ce code-barres n'est pas reconnu (8 à 14 chiffres attendus). Vérifie ce que tu as scanné.";
const ERROR_GENERIC = "Impossible de récupérer cette bière pour le moment.";
const ERROR_NOT_A_BEER_KNOWN = (productName: string) =>
  `Tu as scanné « ${productName} » — ce n'est pas une bière. Tente avec une bouteille de bière.`;
const ERROR_NOT_A_BEER_UNKNOWN =
  "Ce produit n'est pas une bière. Tente avec une bouteille de bière.";

// Placeholder destination for the v0.1 unknown-beer mailto CTAs
// (#796). Will be replaced by a real catalog-suggestion form in v0.2
// once the backend endpoint lands.
const SUPPORT_EMAIL = "contact@brasse-bouillon.com";

function resolveBarcodeParam(barcodeParam?: string | string[]): string | null {
  if (!barcodeParam) return null;
  return Array.isArray(barcodeParam) ? barcodeParam[0] : barcodeParam;
}

function mapErrorToStatus(error: unknown): ScreenStatus {
  if (error instanceof ScanLookupBeerNotFoundError) {
    return {
      kind: "error",
      variant: "not_found",
      message: ERROR_NOT_FOUND,
      canRetry: false,
      barcode: error.barcode,
    };
  }
  if (error instanceof ScanLookupNotABeerError) {
    return {
      kind: "error",
      variant: "not_a_beer",
      message: error.productName
        ? ERROR_NOT_A_BEER_KNOWN(error.productName)
        : ERROR_NOT_A_BEER_UNKNOWN,
      canRetry: false,
      barcode: error.barcode,
      productName: error.productName,
    };
  }
  if (error instanceof ScanLookupServiceUnavailableError) {
    return {
      kind: "error",
      variant: "unavailable",
      message: ERROR_UNAVAILABLE,
      canRetry: true,
    };
  }
  if (error instanceof ScanLookupInvalidBarcodeError) {
    return {
      kind: "error",
      variant: "invalid",
      message: ERROR_INVALID,
      canRetry: false,
    };
  }
  return {
    kind: "error",
    variant: "generic",
    message: ERROR_GENERIC,
    canRetry: true,
  };
}

function buildSuggestCorrectionMailto(barcode: string): string {
  const subject = `Suggestion de correction — code-barres ${barcode}`;
  const body =
    `Bonjour,\n\n` +
    `J'ai scanné une bière que Brasse-Bouillon ne reconnaît pas.\n\n` +
    `Code-barres : ${barcode}\n\n` +
    `Voici les informations que je peux fournir :\n` +
    `• Nom de la bière : \n` +
    `• Brasserie : \n` +
    `• Style : \n` +
    `• Pays / ville : \n\n` +
    `Merci !`;
  return `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(
    subject,
  )}&body=${encodeURIComponent(body)}`;
}

function buildAddBeerMailto(barcode: string): string {
  const subject = `Ajout au catalogue — code-barres ${barcode}`;
  const body =
    `Bonjour,\n\n` +
    `Je propose d'ajouter cette bière au catalogue Brasse-Bouillon.\n\n` +
    `Code-barres : ${barcode}\n\n` +
    `Détails :\n` +
    `• Nom de la bière : \n` +
    `• Brasserie : \n` +
    `• Style : \n` +
    `• ABV : \n` +
    `• IBU : \n\n` +
    `Merci !`;
  return `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(
    subject,
  )}&body=${encodeURIComponent(body)}`;
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

  const lookupQuery = useQuery({
    queryKey: ["scan", "lookup", barcode],
    queryFn: () => lookupBeerByBarcode(barcode as string),
    enabled: Boolean(barcode),
    // Lookup errors are typed business outcomes (not-found, not-a-beer,
    // invalid) mapped to dedicated UI states — auto-retrying them is
    // pointless. Recoverable variants expose a manual "Réessayer" button
    // (canRetry) wired to refetch(), matching the previous behaviour.
    retry: false,
    // Always fetch on mount/scan instead of serving the provider's
    // inherited 30s-stale cache: a freshly catalogued beer (or a fixed
    // not-found) must surface immediately on re-scan, as it did before
    // the migration (the useEffect re-ran on every mount).
    staleTime: 0,
  });

  const status = useMemo<ScreenStatus>(() => {
    if (!barcode) {
      return {
        kind: "error",
        variant: "invalid",
        message: ERROR_INVALID,
        canRetry: false,
      };
    }
    if (lookupQuery.data) {
      return { kind: "ready", result: lookupQuery.data };
    }
    // `isError` stays true while a manual refetch() is in flight, so only
    // surface the error UI when no fetch is running — otherwise pressing
    // "Réessayer" would keep the error visible instead of showing loading.
    if (lookupQuery.isError && !lookupQuery.isFetching) {
      return mapErrorToStatus(lookupQuery.error);
    }
    return { kind: "loading" };
  }, [
    barcode,
    lookupQuery.data,
    lookupQuery.isError,
    lookupQuery.isFetching,
    lookupQuery.error,
  ]);

  const handleRetry = useCallback(() => {
    void lookupQuery.refetch();
  }, [lookupQuery]);

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
        onRetry={status.canRetry ? handleRetry : undefined}
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
        {status.variant === "not_found" && status.barcode ? (
          <UnknownBeerCTAs barcode={status.barcode} />
        ) : null}
        {status.variant === "not_a_beer" ? (
          <NotABeerCTA onScanAgain={handleBack} />
        ) : null}
        {status.variant === "invalid" ? <PhotoFallbackCTA /> : null}
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

        <MatchingRecipesSection
          beer={status.result.item}
          onImported={(recipeId) =>
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

const IMPORT_ERROR_MESSAGE =
  "Impossible d'importer cette recette pour le moment. Réessaie dans quelques instants.";
const MATCHING_LOAD_ERROR =
  "Impossible de charger les recettes équivalentes. Réessaie plus tard.";
const LOW_CONFIDENCE_MESSAGE =
  "Aucune recette très similaire dans la base. Voici les plus proches.";
const EQUIVALENTS_LIMIT = 3;

/**
 * Matching recipes section — pharmacy metaphor split per the
 * brainstorm scan-2026-04-24 §2:
 *
 *   🏆 Brewery recipe   — single card at the top, brand badge + gold
 *                         accent. Only shown when one of the ranked
 *                         recipes has `isOfficial: true`.
 *   🧪 Recettes équivalentes — top 3 non-official picks beneath.
 *
 * `low_confidence` warning surfaces above the equivalents block so
 * Léa la Curieuse knows the proposed alternatives are merely the
 * closest, not genuinely similar.
 */
function MatchingRecipesSection({
  beer,
  onImported,
}: Readonly<{
  beer: Pick<ScanCatalogItem, "id" | "barcode">;
  onImported: (recipeId: string) => void;
}>) {
  const matchingQuery = useQuery({
    queryKey: ["scan", "matching", beer.id ?? beer.barcode],
    queryFn: () => getMatchingRecipes(beer),
    // Single attempt then surface the load-error card, as before.
    retry: false,
    // Re-fetch matches on each scan rather than serving the inherited
    // 30s-stale cache (consistent with the lookup query above).
    staleTime: 0,
  });
  const matching = matchingQuery.data ?? null;

  const importMutation = useMutation({
    mutationFn: (recipe: ScanRecipeMatch) =>
      importRecipeFromCommunity(getImportSourceId(recipe)),
    onSuccess: (result) => {
      Alert.alert(
        "Recette importée",
        `« ${result.name} » a été ajoutée à Mes Recettes.`,
        [
          { text: "Plus tard", style: "cancel" },
          {
            text: "Voir la recette",
            onPress: () => onImported(result.recipeId),
          },
        ],
        { cancelable: true },
      );
    },
    onError: () => {
      Alert.alert("Import impossible", IMPORT_ERROR_MESSAGE);
    },
  });

  const officialRecipe = useMemo<ScanRecipeMatch | null>(() => {
    if (!matching) return null;
    return matching.rankings.find((r) => r.isOfficial) ?? null;
  }, [matching]);

  const equivalentRecipes = useMemo<ReadonlyArray<ScanRecipeMatch>>(() => {
    if (!matching) return [];
    return matching.rankings
      .filter((r) => !r.isOfficial)
      .slice(0, EQUIVALENTS_LIMIT);
  }, [matching]);

  /**
   * Issue #766 — pre-flight confirmation before the import call.
   * Without this, a stray tap on a community recipe row imports it
   * silently. The confirmation Alert offers an explicit "Importer"
   * vs "Annuler" choice so Léa knows what's about to happen.
   */
  const handleImport = useCallback(
    (recipe: ScanRecipeMatch) => {
      if (importMutation.isPending) return;
      Alert.alert(
        "Importer cette recette ?",
        `La recette « ${recipe.name} » sera ajoutée à ton carnet.`,
        [
          { text: "Annuler", style: "cancel" },
          { text: "Importer", onPress: () => importMutation.mutate(recipe) },
        ],
        { cancelable: true },
      );
    },
    [importMutation],
  );

  if (matchingQuery.isError) {
    return (
      <Card style={styles.recipesCard}>
        <Text style={styles.recipesEmpty}>{MATCHING_LOAD_ERROR}</Text>
      </Card>
    );
  }

  // While loading, render nothing — the page already shows the
  // beer hero + at-a-glance, the matching list takes a moment to
  // arrive and a flash of "Aucune recette" would mislead Léa.
  if (!matching) return null;

  if (matching.rankings.length === 0) {
    return (
      <Card style={styles.recipesCard}>
        <Text style={styles.recipesTitle}>🧪 Recettes équivalentes</Text>
        <Text style={styles.recipesEmpty}>
          Aucune recette équivalente n&apos;a encore été partagée pour cette
          bière.
        </Text>
      </Card>
    );
  }

  return (
    <View>
      {officialRecipe ? (
        <Card style={styles.officialCard}>
          <Text style={styles.officialTitle}>🏆 Recette officielle</Text>
          <Text style={styles.officialSubtitle}>
            La recette d&apos;origine, signée par la brasserie
          </Text>
          <RecipeRow
            recipe={officialRecipe}
            isImporting={
              importMutation.isPending &&
              importMutation.variables?.recipeId === officialRecipe.recipeId
            }
            isDisabled={importMutation.isPending}
            onPress={() => handleImport(officialRecipe)}
            highlightOfficial
          />
        </Card>
      ) : null}

      {matching.lowConfidence ? (
        <Text style={styles.lowConfidenceWarning}>
          {LOW_CONFIDENCE_MESSAGE}
        </Text>
      ) : null}

      {equivalentRecipes.length > 0 ? (
        <Card style={styles.recipesCard}>
          <Text style={styles.recipesTitle}>🧪 Recettes équivalentes</Text>
          <Text style={styles.recipesSubtitle}>
            Notées par la communauté Brasse Bouillon
          </Text>
          {equivalentRecipes.map((recipe) => (
            <RecipeRow
              key={recipe.recipeId}
              recipe={recipe}
              isImporting={
                importMutation.isPending &&
                importMutation.variables?.recipeId === recipe.recipeId
              }
              isDisabled={importMutation.isPending}
              onPress={() => handleImport(recipe)}
            />
          ))}
        </Card>
      ) : null}
    </View>
  );
}

/**
 * "Unknown beer" CTAs — shown beneath the not-found error message
 * (#796, persona Léa la Curieuse). Surfaces the scanned barcode so
 * the user can quote it, and offers two outbound mailto routes:
 * a "Suggérer une correction" path (the scan returned the wrong
 * data) and an "Ajouter cette bière" path (the catalog is missing
 * an entry). Both targets are placeholders for the v0.2 catalog
 * suggestion endpoint.
 */
function UnknownBeerCTAs({
  barcode,
}: Readonly<{
  barcode: string;
}>) {
  const handleSuggest = useCallback(() => {
    void Linking.openURL(buildSuggestCorrectionMailto(barcode));
  }, [barcode]);
  const handleAdd = useCallback(() => {
    void Linking.openURL(buildAddBeerMailto(barcode));
  }, [barcode]);
  return (
    <View style={styles.unknownCard}>
      <Text style={styles.unknownLabel}>Code-barres scanné</Text>
      <Text style={styles.unknownBarcode} accessibilityRole="text">
        {barcode}
      </Text>
      <Pressable
        onPress={handleSuggest}
        accessibilityRole="button"
        accessibilityLabel="Suggérer une correction par email"
        style={({ pressed }) => [
          styles.unknownCta,
          pressed ? styles.unknownCtaPressed : null,
        ]}
      >
        <Text style={styles.unknownCtaText}>Suggérer une correction</Text>
      </Pressable>
      <Pressable
        onPress={handleAdd}
        accessibilityRole="button"
        accessibilityLabel="Ajouter cette bière au catalogue par email"
        style={({ pressed }) => [
          styles.unknownCtaSecondary,
          pressed ? styles.unknownCtaPressed : null,
        ]}
      >
        <Text style={styles.unknownCtaSecondaryText}>
          Ajouter cette bière au catalogue
        </Text>
      </Pressable>
    </View>
  );
}

/**
 * "Photo fallback" CTA — shown beneath the invalid-barcode error
 * (#797, sub-PR 3/3 of [Epic] #794). When the camera reads a
 * malformed code-barres, offers the user a forward-looking "take a
 * photo of the label" path. The real photo capture / OCR feature
 * lives in epic #751 and lands in v0.2; for now the CTA opens an
 * informational alert so Léa is not stuck on a dead-end screen.
 */
const PHOTO_FALLBACK_TITLE = "Reconnaissance visuelle de l'étiquette";
const PHOTO_FALLBACK_BODY =
  "Cette fonctionnalité arrive dans la v0.2 (epic #751). En attendant, scanne le code-barres ou saisis-le manuellement.";

function PhotoFallbackCTA() {
  const handlePress = useCallback(() => {
    Alert.alert(PHOTO_FALLBACK_TITLE, PHOTO_FALLBACK_BODY, [{ text: "OK" }]);
  }, []);
  return (
    <View style={styles.unknownCard}>
      <Pressable
        onPress={handlePress}
        accessibilityRole="button"
        accessibilityLabel="Photographier l'étiquette"
        style={({ pressed }) => [
          styles.unknownCta,
          pressed ? styles.unknownCtaPressed : null,
        ]}
      >
        <Text style={styles.unknownCtaText}>
          Photographier l&apos;étiquette
        </Text>
      </Pressable>
    </View>
  );
}

/**
 * "Not a beer" CTA — shown beneath the not-a-beer error message
 * (#798, persona Léa la Curieuse). The product name is already in
 * the error message line itself; this component just offers the
 * single "Scanner une bière" CTA that returns the user to the
 * scan camera so they can try with an actual beer.
 */
function NotABeerCTA({
  onScanAgain,
}: Readonly<{
  onScanAgain: () => void;
}>) {
  return (
    <View style={styles.unknownCard}>
      <Pressable
        onPress={onScanAgain}
        accessibilityRole="button"
        accessibilityLabel="Retourner au scan pour tenter une autre bouteille"
        style={({ pressed }) => [
          styles.unknownCta,
          pressed ? styles.unknownCtaPressed : null,
        ]}
      >
        <Text style={styles.unknownCtaText}>Scanner une bière</Text>
      </Pressable>
    </View>
  );
}

/**
 * Single recipe row — used by both the official 🏆 card and each
 * equivalent recipe in the 🧪 list. `highlightOfficial` swaps the
 * default neutral palette for the gold accent on the official card
 * to honor the pharmacy metaphor (brand vs generic visual cue).
 */
function RecipeRow({
  recipe,
  isImporting,
  isDisabled,
  onPress,
  highlightOfficial = false,
}: Readonly<{
  recipe: ScanRecipeMatch;
  isImporting: boolean;
  isDisabled: boolean;
  onPress: () => void;
  highlightOfficial?: boolean;
}>) {
  const meta: string[] = [recipe.brewer];
  if (recipe.style) meta.push(recipe.style);
  meta.push(`brassée ${recipe.brewedCount} fois`);
  if (recipe.rating > 0) meta.push(`★ ${recipe.rating.toFixed(1)}`);
  const metaLine = meta.join(" · ");
  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.recipeRow,
        highlightOfficial ? styles.recipeRowOfficial : null,
        isDisabled && !isImporting ? styles.recipeRowDisabled : null,
        !isImporting && !isDisabled && pressed ? styles.recipeRowPressed : null,
      ]}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: isImporting }}
      accessibilityLabel={`Importer ${recipe.name} par ${recipe.brewer}${
        recipe.rating > 0 ? `, noté ${recipe.rating} sur 5` : ""
      }`}
    >
      <View style={styles.recipeRowLeft}>
        <Text style={styles.recipeName} numberOfLines={2}>
          {recipe.name}
        </Text>
        <Text style={styles.recipeBrewer}>{metaLine}</Text>
      </View>
      <View style={styles.recipeRowRight}>
        <Text style={styles.recipeAction}>
          {isImporting ? "Import…" : "+ Importer"}
        </Text>
      </View>
    </Pressable>
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

const styles = StyleSheet.create({
  scrollContent: {
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
  },
  officialCard: {
    marginBottom: spacing.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.brand.primary,
    backgroundColor: colors.state.infoBackground,
  },
  officialTitle: {
    fontSize: typography.size.body,
    fontWeight: typography.weight.bold,
    color: colors.brand.primary,
    marginBottom: spacing.xxs,
  },
  officialSubtitle: {
    fontSize: typography.size.caption,
    color: colors.neutral.textSecondary,
    marginBottom: spacing.sm,
  },
  recipeRowOfficial: {
    borderBottomWidth: 0,
  },
  lowConfidenceWarning: {
    fontSize: typography.size.caption,
    color: colors.semantic.warning,
    backgroundColor: colors.state.warningBackground,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
    marginBottom: spacing.sm,
    fontStyle: "italic",
  },
  recipesEmpty: {
    fontSize: typography.size.caption,
    color: colors.neutral.textSecondary,
    fontStyle: "italic",
    paddingVertical: spacing.xs,
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
  recipeRowDisabled: {
    opacity: 0.5,
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
  recipeAction: {
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
  unknownCard: {
    marginTop: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.neutral.white,
    borderWidth: 1,
    borderColor: colors.neutral.border,
  },
  unknownLabel: {
    fontSize: typography.size.caption,
    color: colors.neutral.textSecondary,
    fontWeight: typography.weight.medium,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  unknownBarcode: {
    marginTop: spacing.xxs,
    fontSize: typography.size.h2,
    lineHeight: typography.lineHeight.h2,
    fontWeight: typography.weight.bold,
    color: colors.neutral.textPrimary,
    fontVariant: ["tabular-nums"],
  },
  unknownCta: {
    marginTop: spacing.md,
    backgroundColor: colors.brand.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.sm,
    alignItems: "center",
  },
  unknownCtaText: {
    color: colors.neutral.white,
    fontSize: typography.size.label,
    fontWeight: typography.weight.medium,
  },
  unknownCtaSecondary: {
    marginTop: spacing.xs,
    backgroundColor: "transparent",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.brand.primary,
    alignItems: "center",
  },
  unknownCtaSecondaryText: {
    color: colors.brand.primary,
    fontSize: typography.size.label,
    fontWeight: typography.weight.medium,
  },
  unknownCtaPressed: {
    opacity: 0.7,
  },
});
