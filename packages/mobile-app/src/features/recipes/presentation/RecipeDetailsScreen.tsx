import React, { useEffect, useMemo, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";

import { Card } from "@/core/ui/Card";
import { EmptyStateCard } from "@/core/ui/EmptyStateCard";
import { HeaderBackButton } from "@/core/ui/HeaderBackButton";
import { ListHeader } from "@/core/ui/ListHeader";
import { Screen } from "@/core/ui/Screen";
import { colors, spacing } from "@/core/theme";
import { getErrorMessage } from "@/core/http/http-error";
import { useNavigationFooterOffset } from "@/core/ui/NavigationFooter";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";

import {
  RecipeDetailsViewModel,
  getRecipeDetailsViewModel,
} from "@/features/recipes/application/recipes.use-cases";
import {
  RECIPE_DETAIL_TABS,
  RecipeDetailSideRail,
  RecipeDetailTabId,
} from "@/features/recipes/presentation/components/RecipeDetailSideRail";
import { RecipeStickyCta } from "@/features/recipes/presentation/components/RecipeStickyCta";
import { BrewingTab } from "@/features/recipes/presentation/tabs/BrewingTab";
import { IngredientsTab } from "@/features/recipes/presentation/tabs/IngredientsTab";
import { NotesReviewsTab } from "@/features/recipes/presentation/tabs/NotesReviewsTab";
import { OverviewTab } from "@/features/recipes/presentation/tabs/OverviewTab";
import { WaterTab } from "@/features/recipes/presentation/tabs/WaterTab";
import {
  NON_PUBLIC_WATER_PREFERENCE_OPTIONS,
  NonPublicWaterPreference,
  PUBLIC_RECIPE_WATER_PRESET_BY_ID,
  RecipeProcessDisplayMode,
} from "@/features/recipes/presentation/recipe-details.constants";
import {
  buildIngredientCartItems,
  calculateScalingFactor,
  calculateWaterCompatibility,
  toIngredientCartItem,
} from "@/features/recipes/presentation/recipe-details.utils";
import { IngredientCategory } from "@/features/ingredients/domain/ingredient.types";
import type { WaterStylePresetId } from "@/features/tools/domain/water-profiles";
import {
  DEFAULT_BALANCED_WATER_PROFILE,
  WATER_LOCATION_PROFILES,
  WATER_STYLE_PRESETS,
  buildWaterProfileFromStylePreset,
  getWaterLocationProfileByName,
  getWaterStylePresetById,
} from "@/features/tools/data/water-profiles.data";
import { startBatch } from "@/features/batches/application/batches.use-cases";
import type { RecipeDetailsIngredientItem } from "@/features/recipes/application/recipes.use-cases";

type Props = Readonly<{
  recipeId: string;
}>;

const FALLBACK_LOCAL_WATER_PROFILE = {
  name: "Balanced default",
  region: "Default",
  description: "Fallback profile when water locations are unavailable.",
  ...DEFAULT_BALANCED_WATER_PROFILE,
};

const DEFAULT_LOCAL_WATER_PROFILE_NAME =
  WATER_LOCATION_PROFILES[0]?.name ?? FALLBACK_LOCAL_WATER_PROFILE.name;

const DEFAULT_WATER_STYLE_PRESET_ID: WaterStylePresetId =
  WATER_STYLE_PRESETS[0]?.id ?? "pale-ale";

const DEFAULT_NON_PUBLIC_WATER_PREFERENCE: NonPublicWaterPreference =
  NON_PUBLIC_WATER_PREFERENCE_OPTIONS[0]?.id ?? "style";

const DEFAULT_TARGET_VOLUME_LITRES = 20;

/**
 * Redesigned recipe detail screen — Issue #740 Round 4 v2.
 *
 * Replaces the legacy 1.3 kLoC monolithic screen with a 5-tab
 * vertical-rail layout (Vue / Ingrédients / Eau / Brassage / Notes),
 * an EBC-driven hero shared with the scan flow's BeerInfoCardScreen,
 * and a sticky [Lancer un brassin] CTA pinned across every tab
 * except Notes & revues (where the action is semantically irrelevant).
 *
 * Data fetching uses TanStack Query (useQuery + useMutation) — the
 * mutation cache is reset on retry to clear stale start-batch errors,
 * and the batches cache is invalidated on success so the navigated-to
 * batch list refetches with the freshly created batch.
 */
export function RecipeDetailsScreen({ recipeId }: Props) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const bottomPadding = useNavigationFooterOffset();

  const hasRecipeId = recipeId.trim().length > 0;

  const {
    data: viewModel = null,
    isLoading,
    isFetching,
    isFetched,
    error: queryError,
    refetch,
  } = useQuery<RecipeDetailsViewModel | null>({
    queryKey: ["recipes", "detail", recipeId],
    queryFn: () => getRecipeDetailsViewModel(recipeId),
    enabled: hasRecipeId,
  });

  const startBatchMutation = useMutation({
    mutationFn: () => startBatch(recipeId),
    onSuccess: (batch) => {
      void queryClient.invalidateQueries({ queryKey: ["batches"] });
      router.push(`/(app)/batches/${batch.id}`);
    },
  });

  const [activeTab, setActiveTab] = useState<RecipeDetailTabId>("overview");

  const [targetVolumeLiters, setTargetVolumeLiters] = useState(
    DEFAULT_TARGET_VOLUME_LITRES,
  );
  const [processDisplayMode, setProcessDisplayMode] =
    useState<RecipeProcessDisplayMode>("phases");

  const [selectedLocalWaterProfileName, setSelectedLocalWaterProfileName] =
    useState(DEFAULT_LOCAL_WATER_PROFILE_NAME);
  const [nonPublicWaterPreference, setNonPublicWaterPreference] =
    useState<NonPublicWaterPreference>(DEFAULT_NON_PUBLIC_WATER_PREFERENCE);
  const [selectedWaterStylePresetId, setSelectedWaterStylePresetId] =
    useState<WaterStylePresetId>(DEFAULT_WATER_STYLE_PRESET_ID);
  const [initializedRecipeId, setInitializedRecipeId] = useState<string | null>(
    null,
  );

  const recipe = viewModel?.recipe ?? null;
  const stats = recipe?.stats ?? null;
  const ingredients = viewModel?.ingredients ?? [];
  const equipment = viewModel?.equipment ?? [];
  const steps = viewModel?.steps ?? [];

  const recipeIdForInitialization = recipe?.id ?? null;
  const recipeBaseVolumeForInitialization =
    stats?.volumeLiters ?? DEFAULT_TARGET_VOLUME_LITRES;

  useEffect(() => {
    if (
      !recipeIdForInitialization ||
      recipeIdForInitialization === initializedRecipeId
    ) {
      return;
    }
    setTargetVolumeLiters(recipeBaseVolumeForInitialization);
    setInitializedRecipeId(recipeIdForInitialization);
  }, [
    initializedRecipeId,
    recipeBaseVolumeForInitialization,
    recipeIdForInitialization,
  ]);

  const baseVolumeLiters = stats?.volumeLiters ?? DEFAULT_TARGET_VOLUME_LITRES;
  const scalingFactor = calculateScalingFactor(
    baseVolumeLiters,
    targetVolumeLiters,
  );

  const localWaterProfile =
    getWaterLocationProfileByName(selectedLocalWaterProfileName) ??
    WATER_LOCATION_PROFILES[0] ??
    FALLBACK_LOCAL_WATER_PROFILE;

  // Imported recipes (`importFromCommunity`) get a fresh `id` but
  // keep their lineage via `rootRecipeId`. We try the imported id
  // first, then fall back to the lineage root so a Punk IPA imported
  // from the curated catalog still inherits the curated water preset.
  const publicRecipeStylePresetId = recipe
    ? (PUBLIC_RECIPE_WATER_PRESET_BY_ID[recipe.id] ??
      PUBLIC_RECIPE_WATER_PRESET_BY_ID[recipe.rootRecipeId ?? ""])
    : undefined;
  const publicRecipeStylePreset = publicRecipeStylePresetId
    ? getWaterStylePresetById(publicRecipeStylePresetId)
    : null;

  const selectedWaterStylePreset =
    getWaterStylePresetById(selectedWaterStylePresetId) ??
    WATER_STYLE_PRESETS[0] ??
    null;

  const recommendedWaterProfile = useMemo(() => {
    if (recipe?.visibility === "public" || publicRecipeStylePreset) {
      return publicRecipeStylePreset
        ? buildWaterProfileFromStylePreset(publicRecipeStylePreset)
        : DEFAULT_BALANCED_WATER_PROFILE;
    }
    if (nonPublicWaterPreference === "default") {
      return DEFAULT_BALANCED_WATER_PROFILE;
    }
    if (nonPublicWaterPreference === "location") {
      // The "location" preference means "I don't have a stronger
      // recommendation in mind, just stick with what comes out of my
      // tap." We surface a balanced baseline as the recommended
      // profile rather than echoing the local profile, otherwise the
      // compatibility score becomes a 100% tautology.
      return DEFAULT_BALANCED_WATER_PROFILE;
    }
    if (!selectedWaterStylePreset) {
      return DEFAULT_BALANCED_WATER_PROFILE;
    }
    return buildWaterProfileFromStylePreset(selectedWaterStylePreset);
  }, [
    nonPublicWaterPreference,
    publicRecipeStylePreset,
    recipe?.visibility,
    selectedWaterStylePreset,
  ]);

  const recommendedWaterLabel = useMemo(() => {
    if (publicRecipeStylePreset) {
      return `Profil recommandé : ${publicRecipeStylePreset.name}`;
    }
    if (recipe?.visibility === "public") {
      return "Profil recommandé : équilibré par défaut";
    }
    if (nonPublicWaterPreference === "default") {
      return "Profil recommandé : équilibré par défaut";
    }
    if (nonPublicWaterPreference === "location") {
      return "Profil recommandé : équilibré par défaut (mode local)";
    }
    if (!selectedWaterStylePreset) {
      return "Profil recommandé : équilibré par défaut";
    }
    return `Profil recommandé : ${selectedWaterStylePreset.name}`;
  }, [
    nonPublicWaterPreference,
    publicRecipeStylePreset,
    recipe?.visibility,
    selectedWaterStylePreset,
  ]);

  const waterCompatibility = useMemo(
    () =>
      calculateWaterCompatibility(recommendedWaterProfile, localWaterProfile),
    [localWaterProfile, recommendedWaterProfile],
  );

  // The query layer carries the fetch error; the mutation layer
  // carries the start-batch error. Either feeds the screen-level
  // banner so the user always sees the most recent failure.
  const error = queryError
    ? isFetching
      ? null
      : getErrorMessage(queryError, "Impossible de charger la recette")
    : startBatchMutation.error
      ? getErrorMessage(
          startBatchMutation.error,
          "Le démarrage du brassin a échoué",
        )
      : null;

  // Add-to-cart actions stay wired but no longer accumulate a local
  // list on the detail screen — the cart preview was retired with the
  // 5-tab redesign. Each call still produces a `LocalCartItem` so the
  // forthcoming global cart store (Issue follow-up to #918) can pick
  // it up without further changes here.
  const handleAddIngredientToCart = (
    ingredient: RecipeDetailsIngredientItem,
  ) => {
    void toIngredientCartItem(ingredient, scalingFactor);
  };

  const handleAddAllIngredientsToCart = () => {
    void buildIngredientCartItems(ingredients, scalingFactor);
  };

  const handleOpenIngredient = (ingredient: {
    id: string;
    category: IngredientCategory;
  }) => {
    if (ingredient.category === "malt") {
      router.push({
        pathname: "/(app)/ingredients/malts/[id]",
        params: {
          id: ingredient.id,
          returnTo: "/(app)/recipes/[id]",
          returnRecipeId: recipeId,
        },
      });
      return;
    }
    router.push({
      pathname: "/(app)/ingredients/[category]/[id]",
      params: {
        category: ingredient.category,
        id: ingredient.id,
        returnTo: "/(app)/recipes/[id]",
        returnRecipeId: recipeId,
      },
    });
  };

  const handleOpenShop = () => {
    router.push("/(app)/shop");
  };

  const handleOpenWaterCalculator = () => {
    router.push({
      pathname: "/(app)/tools/[slug]/calculator",
      params: { slug: "eau" },
    });
  };

  const handleGoBack = () => {
    router.replace("/recipes");
  };

  const handleStartBatch = () => {
    if (!hasRecipeId || startBatchMutation.isPending) {
      return;
    }
    startBatchMutation.mutate();
  };

  // Reset both the query error AND the mutation error when the user
  // taps "Réessayer" — otherwise a previous failed batch start would
  // keep the error banner up forever, even after a clean recipe
  // refetch (Codex / Copilot review feedback on PR #916).
  const handleRetry = () => {
    if (startBatchMutation.error) {
      startBatchMutation.reset();
    }
    void refetch();
  };

  const provenanceLabel = useMemo(() => {
    if (!recipe) {
      return null;
    }
    const sourceId = (recipe as { importedFromRecipeId?: string | null })
      .importedFromRecipeId;
    const provenance = (recipe as { importProvenance?: string | null })
      .importProvenance;
    if (typeof provenance === "string" && provenance.trim().length > 0) {
      return `Importée • ${provenance.trim()}`;
    }
    if (typeof sourceId === "string" && sourceId.trim().length > 0) {
      return "Importée depuis le scan";
    }
    return null;
  }, [recipe]);

  const isStarting = startBatchMutation.isPending;
  const ctaLabel = isStarting ? "Démarrage..." : "Lancer un brassin";
  const ctaDisabled = isStarting || isLoading || !recipe;
  const showStickyCta = activeTab !== "reviews";

  if (!hasRecipeId) {
    return (
      <Screen>
        <EmptyStateCard
          title="Recette introuvable"
          description="Le lien que tu as ouvert ne contient pas d'identifiant de recette."
        />
      </Screen>
    );
  }

  if (isFetched && !isLoading && !viewModel && !error) {
    return (
      <Screen>
        <EmptyStateCard
          title="Recette introuvable"
          description="Cette recette n'a pas pu être chargée."
        />
      </Screen>
    );
  }

  return (
    <Screen
      isLoading={isLoading && !viewModel}
      error={error}
      onRetry={handleRetry}
    >
      <View style={styles.headerWrapper}>
        <ListHeader
          title="Détail recette"
          subtitle="Carnet de brassage"
          action={
            <HeaderBackButton
              label="Mes recettes"
              accessibilityLabel="Retour à mes recettes"
              onPress={handleGoBack}
            />
          }
        />
      </View>

      <View style={styles.body}>
        <RecipeDetailSideRail activeTab={activeTab} onChange={setActiveTab} />

        <View style={styles.tabContent}>
          <ScrollView
            contentContainerStyle={[
              styles.scrollContent,
              { paddingBottom: bottomPadding + (showStickyCta ? 96 : 0) },
            ]}
            showsVerticalScrollIndicator={false}
          >
            {recipe ? (
              <>
                {activeTab === "overview" ? (
                  <OverviewTab
                    recipe={recipe}
                    equipment={equipment}
                    targetVolumeLiters={targetVolumeLiters}
                    provenanceLabel={provenanceLabel}
                  />
                ) : null}

                {activeTab === "ingredients" ? (
                  <IngredientsTab
                    ingredients={ingredients}
                    baseVolumeLiters={baseVolumeLiters}
                    targetVolumeLiters={targetVolumeLiters}
                    scalingFactor={scalingFactor}
                    onChangeTargetVolume={setTargetVolumeLiters}
                    onAddIngredientToCart={handleAddIngredientToCart}
                    onAddAllIngredientsToCart={handleAddAllIngredientsToCart}
                    onOpenIngredient={handleOpenIngredient}
                    onOpenShop={handleOpenShop}
                  />
                ) : null}

                {activeTab === "water" ? (
                  <WaterTab
                    recipe={recipe}
                    recommendedWaterLabel={recommendedWaterLabel}
                    recommendedWaterProfile={recommendedWaterProfile}
                    localWaterProfile={localWaterProfile}
                    compatibility={waterCompatibility}
                    targetVolumeLiters={targetVolumeLiters}
                    nonPublicWaterPreference={nonPublicWaterPreference}
                    onChangeNonPublicWaterPreference={
                      setNonPublicWaterPreference
                    }
                    selectedWaterStylePresetId={selectedWaterStylePresetId}
                    onChangeWaterStylePreset={setSelectedWaterStylePresetId}
                    selectedLocalWaterProfileName={
                      selectedLocalWaterProfileName
                    }
                    onChangeLocalWaterProfileName={
                      setSelectedLocalWaterProfileName
                    }
                    onOpenWaterCalculator={handleOpenWaterCalculator}
                  />
                ) : null}

                {activeTab === "brewing" ? (
                  <BrewingTab
                    ingredientsCount={ingredients.length}
                    equipmentCount={equipment.length}
                    steps={steps}
                    processDisplayMode={processDisplayMode}
                    onChangeProcessDisplayMode={setProcessDisplayMode}
                  />
                ) : null}

                {activeTab === "reviews" ? <NotesReviewsTab /> : null}
              </>
            ) : (
              <Card style={styles.placeholderCard} />
            )}
          </ScrollView>
        </View>
      </View>

      {showStickyCta ? (
        <RecipeStickyCta
          label={ctaLabel}
          onPress={handleStartBatch}
          disabled={ctaDisabled}
          bottomOffset={bottomPadding}
        />
      ) : null}
    </Screen>
  );
}

export type { RecipeDetailTabId };
export { RECIPE_DETAIL_TABS };

const styles = StyleSheet.create({
  headerWrapper: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
  body: {
    flex: 1,
    flexDirection: "row",
  },
  tabContent: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  placeholderCard: {
    margin: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.brand.background,
  },
});
