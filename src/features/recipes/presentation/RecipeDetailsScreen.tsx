import { colors, radius, spacing, typography } from "@/core/theme";
import {
  RecipeDetailsViewModel,
  getRecipeDetailsViewModel,
} from "@/features/recipes/application/recipes.use-cases";
import {
  BREWING_PHASES,
  NON_PUBLIC_WATER_PREFERENCE_OPTIONS,
  NonPublicWaterPreference,
  PUBLIC_RECIPE_WATER_PRESET_BY_ID,
  RECIPE_PROCESS_DISPLAY_OPTIONS,
  RECIPE_VOLUME_INPUT_MODES,
  RecipeProcessDisplayMode,
  RecipeVolumeInputMode,
} from "@/features/recipes/presentation/recipe-details.constants";
import {
  WATER_METRIC_LABELS,
  buildIngredientCartItems,
  calculateScalingFactor,
  calculateWaterCompatibility,
  formatQuantity,
  getIngredientGroupEntries,
  groupIngredientsByType,
  isVolumeCompatible,
  parseTargetVolume,
  scaleQuantity,
  toEquipmentCartItem,
  toIngredientCartItem,
} from "@/features/recipes/presentation/recipe-details.utils";
import {
  addLocalCartItem,
  addLocalCartItems,
  getLocalCartLineCount,
  getLocalCartTotalQuantity,
} from "@/features/shop/application/cart.use-cases";
import {
  DEFAULT_BALANCED_WATER_PROFILE,
  WATER_LOCATION_PROFILES,
  WATER_STYLE_PRESETS,
  buildWaterProfileFromStylePreset,
  getWaterLocationProfileByName,
  getWaterStylePresetById,
} from "@/features/tools/data/water-profiles.data";
import React, { useEffect, useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { getErrorMessage } from "@/core/http/http-error";
import { Card } from "@/core/ui/Card";
import { EmptyStateCard } from "@/core/ui/EmptyStateCard";
import { PrimaryButton } from "@/core/ui/PrimaryButton";
import { Screen } from "@/core/ui/Screen";
import { startBatch } from "@/features/batches/application/batches.use-cases";
import { IngredientCategory } from "@/features/ingredients/domain/ingredient.types";
import type { LocalCartItem } from "@/features/shop/domain/cart.types";
import type { WaterStylePresetId } from "@/features/tools/domain/water-profiles";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

type Props = {
  recipeId: string;
};

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

export function RecipeDetailsScreen({ recipeId }: Props) {
  const router = useRouter();
  const [viewModel, setViewModel] = useState<RecipeDetailsViewModel | null>(
    null,
  );
  const [hasFetched, setHasFetched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [volumeInputMode, setVolumeInputMode] =
    useState<RecipeVolumeInputMode>("manual");
  const [targetVolumeInput, setTargetVolumeInput] = useState("20");
  const [selectedEquipmentId, setSelectedEquipmentId] = useState<string | null>(
    null,
  );
  const [processDisplayMode, setProcessDisplayMode] =
    useState<RecipeProcessDisplayMode>("phases");

  const [localCartItems, setLocalCartItems] = useState<LocalCartItem[]>([]);

  const [selectedLocalWaterProfileName, setSelectedLocalWaterProfileName] =
    useState(DEFAULT_LOCAL_WATER_PROFILE_NAME);
  const [nonPublicWaterPreference, setNonPublicWaterPreference] =
    useState<NonPublicWaterPreference>("style");
  const [selectedWaterStylePresetId, setSelectedWaterStylePresetId] =
    useState<WaterStylePresetId>(DEFAULT_WATER_STYLE_PRESET_ID);
  const [initializedRecipeId, setInitializedRecipeId] = useState<string | null>(
    null,
  );

  const fetchRecipe = async () => {
    if (!recipeId) {
      setError("Missing recipe id.");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const data = await getRecipeDetailsViewModel(recipeId);
      setViewModel(data);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to load recipe"));
    } finally {
      setIsLoading(false);
      setHasFetched(true);
    }
  };

  const handleStartBatch = async () => {
    if (!recipeId || isCapacityBlocked) {
      return;
    }
    setIsStarting(true);
    try {
      const batch = await startBatch(recipeId);
      router.push(`/(app)/batches/${batch.id}`);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to start batch"));
    } finally {
      setIsStarting(false);
    }
  };

  useEffect(() => {
    fetchRecipe();
  }, [recipeId]);

  const recipe = viewModel?.recipe;
  const stats = recipe?.stats;
  const ingredients = viewModel?.ingredients ?? [];
  const equipment = viewModel?.equipment ?? [];
  const steps = viewModel?.steps ?? [];
  const recipeIdForInitialization = recipe?.id ?? null;
  const recipeBaseVolumeForInitialization = recipe?.stats?.volumeLiters ?? 20;
  const firstEquipmentId = equipment[0]?.equipmentId ?? null;

  useEffect(() => {
    if (
      !recipeIdForInitialization ||
      recipeIdForInitialization === initializedRecipeId
    ) {
      return;
    }

    setTargetVolumeInput(String(recipeBaseVolumeForInitialization));
    setSelectedEquipmentId(firstEquipmentId);
    setInitializedRecipeId(recipeIdForInitialization);
    setLocalCartItems([]);
  }, [
    firstEquipmentId,
    initializedRecipeId,
    recipeBaseVolumeForInitialization,
    recipeIdForInitialization,
  ]);

  if (hasFetched && !isLoading && !viewModel && !error) {
    return (
      <Screen>
        <EmptyStateCard
          title="Recipe not found"
          description="This recipe could not be loaded."
        />
      </Screen>
    );
  }

  const baseVolumeLiters = stats?.volumeLiters ?? 20;
  const targetVolumeLiters = parseTargetVolume(
    targetVolumeInput,
    baseVolumeLiters,
  );
  const scalingFactor = calculateScalingFactor(
    baseVolumeLiters,
    targetVolumeLiters,
  );

  const selectedEquipment =
    equipment.find((item) => item.equipmentId === selectedEquipmentId) ?? null;
  const selectedEquipmentCapacity =
    selectedEquipment?.equipment?.volumeLiters ?? null;
  const isCapacityBlocked =
    volumeInputMode === "equipment" &&
    !isVolumeCompatible(targetVolumeLiters, selectedEquipmentCapacity);

  const groupedIngredients = useMemo(
    () => groupIngredientsByType(ingredients),
    [ingredients],
  );
  const ingredientGroupEntries = useMemo(
    () => getIngredientGroupEntries(groupedIngredients),
    [groupedIngredients],
  );

  const localCartLineCount = getLocalCartLineCount(localCartItems);
  const localCartTotalQuantity = getLocalCartTotalQuantity(localCartItems);

  const localWaterProfile =
    getWaterLocationProfileByName(selectedLocalWaterProfileName) ??
    WATER_LOCATION_PROFILES[0] ??
    FALLBACK_LOCAL_WATER_PROFILE;

  const publicRecipeStylePresetId = recipe
    ? PUBLIC_RECIPE_WATER_PRESET_BY_ID[recipe.id]
    : undefined;
  const publicRecipeStylePreset = publicRecipeStylePresetId
    ? getWaterStylePresetById(publicRecipeStylePresetId)
    : null;

  const selectedWaterStylePreset =
    getWaterStylePresetById(selectedWaterStylePresetId) ??
    WATER_STYLE_PRESETS[0] ??
    null;

  const recommendedWaterProfile = (() => {
    if (recipe?.visibility === "public") {
      if (publicRecipeStylePreset) {
        return buildWaterProfileFromStylePreset(publicRecipeStylePreset);
      }

      return DEFAULT_BALANCED_WATER_PROFILE;
    }

    if (nonPublicWaterPreference === "default") {
      return DEFAULT_BALANCED_WATER_PROFILE;
    }

    if (nonPublicWaterPreference === "location") {
      return localWaterProfile;
    }

    if (!selectedWaterStylePreset) {
      return DEFAULT_BALANCED_WATER_PROFILE;
    }

    return buildWaterProfileFromStylePreset(selectedWaterStylePreset);
  })();

  const recommendedWaterLabel = (() => {
    if (recipe?.visibility === "public") {
      if (publicRecipeStylePreset) {
        return `Public recipe preset: ${publicRecipeStylePreset.name}`;
      }

      return "Public recipe preset: balanced default";
    }

    if (nonPublicWaterPreference === "default") {
      return "Recommended profile: balanced default";
    }

    if (nonPublicWaterPreference === "location") {
      return "Recommended profile: your selected location";
    }

    if (!selectedWaterStylePreset) {
      return "Recommended profile: balanced default";
    }

    return `Recommended profile: ${selectedWaterStylePreset.name}`;
  })();

  const waterCompatibility = calculateWaterCompatibility(
    recommendedWaterProfile,
    localWaterProfile,
  );

  const navigateToIngredient = (ingredient: {
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

    router.push(`/(app)/ingredients/${ingredient.category}`);
  };

  const handleVolumeInputChange = (value: string) => {
    const normalized = value.replace(/[^0-9.,]/g, "");
    setTargetVolumeInput(normalized);
  };

  const handleVolumeModeChange = (mode: RecipeVolumeInputMode) => {
    setVolumeInputMode(mode);
    if (mode === "equipment" && selectedEquipmentCapacity) {
      setTargetVolumeInput(String(selectedEquipmentCapacity));
    }
  };

  const handleSelectEquipment = (equipmentId: string) => {
    setSelectedEquipmentId(equipmentId);
    const selected = equipment.find((item) => item.equipmentId === equipmentId);
    if (volumeInputMode === "equipment" && selected?.equipment?.volumeLiters) {
      setTargetVolumeInput(String(selected.equipment.volumeLiters));
    }
  };

  const handleAddIngredientToCart = (
    ingredient: RecipeDetailsViewModel["ingredients"][number],
  ) => {
    const cartItem = toIngredientCartItem(ingredient, scalingFactor);
    setLocalCartItems((previous) => addLocalCartItem(previous, cartItem));
  };

  const handleAddAllIngredientsToCart = () => {
    const cartItems = buildIngredientCartItems(ingredients, scalingFactor);
    setLocalCartItems((previous) => addLocalCartItems(previous, cartItems));
  };

  const handleAddEquipmentToCart = (equipmentId: string) => {
    const equipmentItem = equipment.find(
      (item) => item.equipmentId === equipmentId,
    );
    if (!equipmentItem) {
      return;
    }

    const cartItem = toEquipmentCartItem(equipmentItem);
    setLocalCartItems((previous) => addLocalCartItem(previous, cartItem));
  };

  const openShop = () => {
    router.push("/(app)/shop");
  };

  const openWaterCalculator = () => {
    router.push({
      pathname: "/(app)/tools/[slug]/calculator",
      params: { slug: "eau" },
    });
  };

  const formatLocalCartQuantity = Number.isFinite(localCartTotalQuantity)
    ? Number.isInteger(localCartTotalQuantity)
      ? String(localCartTotalQuantity)
      : localCartTotalQuantity.toFixed(2)
    : "0";

  return (
    <Screen isLoading={isLoading} error={error} onRetry={fetchRecipe}>
      <ScrollView contentContainerStyle={styles.content}>
        {recipe ? (
          <Card style={styles.headerCard}>
            <Text style={styles.collectionLabel}>My Recipe Book</Text>
            <Text style={styles.title}>{recipe.name}</Text>
            {recipe.description ? (
              <Text style={styles.subtitle}>{recipe.description}</Text>
            ) : null}

            {stats ? (
              <View style={styles.statsGrid}>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>IBU</Text>
                  <Text style={styles.statValue}>{stats.ibu}</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>ABV</Text>
                  <Text style={styles.statValue}>{stats.abv}%</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>OG</Text>
                  <Text style={styles.statValue}>{stats.og}</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>FG</Text>
                  <Text style={styles.statValue}>{stats.fg}</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Base volume</Text>
                  <Text style={styles.statValue}>{stats.volumeLiters} L</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Target volume</Text>
                  <Text style={styles.statValue}>{targetVolumeLiters} L</Text>
                </View>
              </View>
            ) : null}

            <Text style={styles.referenceHint}>
              IBU, ABV, OG, and FG remain reference values from the base recipe.
            </Text>
          </Card>
        ) : null}

        <Card style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Scale my batch</Text>

          <View style={styles.toggleRow}>
            {RECIPE_VOLUME_INPUT_MODES.map((mode) => (
              <Pressable
                key={mode.id}
                testID={`recipe-volume-mode-${mode.id}`}
                accessibilityRole="button"
                accessibilityLabel={`Use ${mode.label.toLowerCase()} mode`}
                style={[
                  styles.toggleChip,
                  volumeInputMode === mode.id && styles.toggleChipActive,
                ]}
                onPress={() => handleVolumeModeChange(mode.id)}
              >
                <Text
                  style={[
                    styles.toggleChipText,
                    volumeInputMode === mode.id && styles.toggleChipTextActive,
                  ]}
                >
                  {mode.label}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.helperText}>
            {
              RECIPE_VOLUME_INPUT_MODES.find(
                (mode) => mode.id === volumeInputMode,
              )?.helper
            }
          </Text>

          <Text style={styles.fieldLabel}>Target volume (L)</Text>
          <TextInput
            testID="recipe-target-volume-input"
            accessibilityLabel="Target volume in liters"
            style={styles.textInput}
            keyboardType="numeric"
            value={targetVolumeInput}
            onChangeText={handleVolumeInputChange}
            placeholder="20"
          />

          {volumeInputMode === "equipment" ? (
            <>
              <Text style={styles.fieldLabel}>Equipment capacity</Text>

              {equipment.length === 0 ? (
                <Text style={styles.emptyText}>
                  No equipment found in this recipe.
                </Text>
              ) : (
                <View style={styles.choiceWrap}>
                  {equipment.map((item) => {
                    const isSelected = item.equipmentId === selectedEquipmentId;
                    const capacity = item.equipment?.volumeLiters;

                    return (
                      <Pressable
                        key={item.equipmentId}
                        accessibilityRole="button"
                        accessibilityLabel={`Select equipment ${item.equipment?.name ?? "unknown"}`}
                        style={[
                          styles.choiceChip,
                          isSelected && styles.choiceChipActive,
                        ]}
                        onPress={() => handleSelectEquipment(item.equipmentId)}
                      >
                        <Text
                          style={[
                            styles.choiceChipText,
                            isSelected && styles.choiceChipTextActive,
                          ]}
                        >
                          {item.equipment?.name ?? "Unknown"}
                          {capacity ? ` • ${capacity}L` : ""}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              )}
            </>
          ) : null}

          {isCapacityBlocked && selectedEquipmentCapacity ? (
            <View style={styles.warningBox}>
              <Text style={styles.warningTitle}>Volume not feasible</Text>
              <Text style={styles.warningText}>
                Your target ({targetVolumeLiters} L) is above the selected
                equipment capacity ({selectedEquipmentCapacity} L).
              </Text>
            </View>
          ) : null}
        </Card>

        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Ingredients by type</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Open shop from ingredients section"
            style={styles.inlineAction}
            onPress={openShop}
          >
            <Ionicons
              name="cart-outline"
              size={16}
              color={colors.brand.secondary}
            />
            <Text style={styles.inlineActionText}>Shop</Text>
          </Pressable>
        </View>

        <Card style={styles.sectionCard}>
          <PrimaryButton
            testID="recipe-add-all-ingredients-button"
            label="Add all ingredients to local cart"
            onPress={handleAddAllIngredientsToCart}
            disabled={ingredients.length === 0}
          />

          {ingredients.length === 0 ? (
            <Text style={styles.emptyText}>
              No ingredients listed for this recipe.
            </Text>
          ) : (
            ingredientGroupEntries.map(({ key, label }) => (
              <View key={key} style={styles.groupBlock}>
                <Text style={styles.groupTitle}>{label}</Text>

                {groupedIngredients[key].map((item, index) => {
                  const quantity = formatQuantity(
                    scaleQuantity(item.amount, scalingFactor),
                    item.unit,
                  );

                  return (
                    <View
                      key={`${item.ingredientId}-${item.timing ?? "no-timing"}-${index}`}
                      style={styles.listItem}
                    >
                      <Pressable
                        style={styles.listItemMainPressable}
                        accessibilityRole="button"
                        accessibilityLabel={`Open ingredient details for ${item.ingredient?.name ?? "unknown ingredient"}`}
                        disabled={!item.ingredient}
                        onPress={() => {
                          if (!item.ingredient) {
                            return;
                          }

                          navigateToIngredient(item.ingredient);
                        }}
                      >
                        <Text style={styles.listItemTitle}>
                          {item.ingredient?.name ?? "Unknown ingredient"}
                        </Text>
                        <Text style={styles.listItemMeta}>
                          {quantity}
                          {item.timing ? ` • ${item.timing}` : ""}
                        </Text>
                        {item.notes ? (
                          <Text style={styles.listItemNotes}>{item.notes}</Text>
                        ) : null}
                      </Pressable>

                      <Pressable
                        testID={`recipe-add-ingredient-${item.ingredientId}-${index}`}
                        accessibilityRole="button"
                        accessibilityLabel={`Add ${item.ingredient?.name ?? "ingredient"} to local cart`}
                        style={styles.addActionButton}
                        onPress={() => handleAddIngredientToCart(item)}
                      >
                        <Ionicons
                          name="add-circle-outline"
                          size={20}
                          color={colors.brand.secondary}
                        />
                      </Pressable>
                    </View>
                  );
                })}
              </View>
            ))
          )}
        </Card>

        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Equipment</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Open shop from equipment section"
            style={styles.inlineAction}
            onPress={openShop}
          >
            <Ionicons
              name="cart-outline"
              size={16}
              color={colors.brand.secondary}
            />
            <Text style={styles.inlineActionText}>Shop</Text>
          </Pressable>
        </View>

        <Card style={styles.sectionCard}>
          {equipment.length === 0 ? (
            <Text style={styles.emptyText}>
              No equipment listed for this recipe.
            </Text>
          ) : (
            equipment.map((item) => (
              <View key={item.equipmentId} style={styles.listItem}>
                <View style={styles.listItemMain}>
                  <Text style={styles.listItemTitle}>
                    {item.equipment?.name ?? "Unknown equipment"}
                  </Text>
                  <Text style={styles.listItemMeta}>
                    {item.role ?? item.equipment?.type ?? "General"}
                    {item.equipment?.volumeLiters
                      ? ` • ${item.equipment.volumeLiters} L`
                      : ""}
                  </Text>
                </View>

                <Pressable
                  testID={`recipe-add-equipment-${item.equipmentId}`}
                  accessibilityRole="button"
                  accessibilityLabel={`Add ${item.equipment?.name ?? "equipment"} to local cart`}
                  style={styles.addActionButton}
                  onPress={() => handleAddEquipmentToCart(item.equipmentId)}
                >
                  <Ionicons
                    name="add-circle-outline"
                    size={20}
                    color={colors.brand.secondary}
                  />
                </Pressable>
              </View>
            ))
          )}
        </Card>

        <Card style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Local cart</Text>
          <Text style={styles.helperText}>
            {localCartLineCount} lines • {formatLocalCartQuantity} total
            quantity
          </Text>

          {localCartItems.length === 0 ? (
            <Text style={styles.emptyText}>
              Your local cart is empty. Add ingredients or equipment from this
              recipe.
            </Text>
          ) : (
            localCartItems.slice(0, 5).map((item) => (
              <View key={item.key} style={styles.cartRow}>
                <Text style={styles.cartRowLabel}>{item.name}</Text>
                <Text style={styles.cartRowValue}>
                  {formatQuantity(item.quantity, item.unit)}
                </Text>
              </View>
            ))
          )}
        </Card>

        <Text style={styles.sectionTitle}>Water profile compatibility</Text>
        <Card style={styles.sectionCard}>
          <Text style={styles.helperText}>{recommendedWaterLabel}</Text>

          {recipe?.visibility !== "public" ? (
            <View style={styles.toggleRow}>
              {NON_PUBLIC_WATER_PREFERENCE_OPTIONS.map((option) => (
                <Pressable
                  key={option.id}
                  accessibilityRole="button"
                  accessibilityLabel={`Use ${option.label.toLowerCase()} recommendation`}
                  style={[
                    styles.toggleChip,
                    nonPublicWaterPreference === option.id &&
                      styles.toggleChipActive,
                  ]}
                  onPress={() => setNonPublicWaterPreference(option.id)}
                >
                  <Text
                    style={[
                      styles.toggleChipText,
                      nonPublicWaterPreference === option.id &&
                        styles.toggleChipTextActive,
                    ]}
                  >
                    {option.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          ) : null}

          {recipe?.visibility !== "public" &&
          nonPublicWaterPreference === "style" ? (
            <View style={styles.choiceWrap}>
              {WATER_STYLE_PRESETS.map((preset) => {
                const isSelected = preset.id === selectedWaterStylePresetId;
                return (
                  <Pressable
                    key={preset.id}
                    accessibilityRole="button"
                    accessibilityLabel={`Select water style preset ${preset.name}`}
                    style={[
                      styles.choiceChip,
                      isSelected && styles.choiceChipActive,
                    ]}
                    onPress={() => setSelectedWaterStylePresetId(preset.id)}
                  >
                    <Text
                      style={[
                        styles.choiceChipText,
                        isSelected && styles.choiceChipTextActive,
                      ]}
                    >
                      {preset.name}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          ) : null}

          <Text style={styles.fieldLabel}>Your water location</Text>
          <View style={styles.choiceWrap}>
            {WATER_LOCATION_PROFILES.map((profile) => {
              const isSelected = profile.name === selectedLocalWaterProfileName;

              return (
                <Pressable
                  key={profile.name}
                  accessibilityRole="button"
                  accessibilityLabel={`Select water location ${profile.name}`}
                  style={[
                    styles.choiceChip,
                    isSelected && styles.choiceChipActive,
                  ]}
                  onPress={() => setSelectedLocalWaterProfileName(profile.name)}
                >
                  <Text
                    style={[
                      styles.choiceChipText,
                      isSelected && styles.choiceChipTextActive,
                    ]}
                  >
                    {profile.name}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.compatibilityCard}>
            <Text style={styles.compatibilityTitle}>
              Compatibility score: {waterCompatibility.score}% (
              {waterCompatibility.label})
            </Text>
            <Text style={styles.compatibilitySubtitle}>
              {waterCompatibility.matchedMetrics}/
              {waterCompatibility.totalMetrics} metrics near target range
            </Text>
          </View>

          {(
            Object.keys(
              WATER_METRIC_LABELS,
            ) as (keyof typeof WATER_METRIC_LABELS)[]
          ).map((metric) => (
            <View key={metric} style={styles.metricRow}>
              <Text style={styles.metricLabel}>
                {WATER_METRIC_LABELS[metric]}
              </Text>
              <Text style={styles.metricValue}>
                {recommendedWaterProfile[metric]} / {localWaterProfile[metric]}{" "}
                ppm
              </Text>
            </View>
          ))}

          <PrimaryButton
            label="Compare in Water Calculator"
            onPress={openWaterCalculator}
          />
        </Card>

        <Text style={styles.sectionTitle}>Process preview</Text>
        <View style={styles.toggleRow}>
          {RECIPE_PROCESS_DISPLAY_OPTIONS.map((option) => (
            <Pressable
              key={option.id}
              testID={`recipe-process-filter-${option.id}`}
              accessibilityRole="button"
              accessibilityLabel={`Use ${option.label.toLowerCase()} process display mode`}
              style={[
                styles.toggleChip,
                processDisplayMode === option.id && styles.toggleChipActive,
              ]}
              onPress={() => setProcessDisplayMode(option.id)}
            >
              <Text
                style={[
                  styles.toggleChipText,
                  processDisplayMode === option.id &&
                    styles.toggleChipTextActive,
                ]}
              >
                {option.label}
              </Text>
            </Pressable>
          ))}
        </View>

        <Card style={styles.sectionCard}>
          {processDisplayMode === "phases"
            ? BREWING_PHASES.map((phase) => (
                <View key={phase.id} style={styles.phaseRow}>
                  <Text style={styles.phaseTitle}>{phase.title}</Text>
                  <Text style={styles.phaseDetails}>{phase.details}</Text>
                </View>
              ))
            : null}

          {processDisplayMode === "recipe" ? (
            steps.length > 0 ? (
              steps.map((item) => (
                <View
                  key={`${item.recipeId}-${item.stepOrder}`}
                  style={styles.stepRow}
                >
                  <View style={styles.stepHeader}>
                    <Text style={styles.stepTitle}>
                      {item.stepOrder + 1}. {item.label}
                    </Text>
                    <Text style={styles.stepType}>{item.type}</Text>
                  </View>
                  {item.description ? (
                    <Text style={styles.stepDescription}>
                      {item.description}
                    </Text>
                  ) : null}
                </View>
              ))
            ) : (
              <Text style={styles.emptyText}>
                No steps available for this recipe.
              </Text>
            )
          ) : null}

          {processDisplayMode === "compact" ? (
            <>
              <Text style={styles.compactStat}>
                Recipe steps: {steps.length}
              </Text>
              <Text style={styles.compactStat}>
                Ingredients: {ingredients.length}
              </Text>
              <Text style={styles.compactStat}>
                Equipment: {equipment.length}
              </Text>
              {steps[0] ? (
                <Text style={styles.compactHint}>
                  Next key step: {steps[0].label}
                </Text>
              ) : null}
            </>
          ) : null}
        </Card>

        <PrimaryButton
          label={isStarting ? "Starting..." : "Start Batch"}
          onPress={handleStartBatch}
          disabled={isStarting || isLoading || !recipe || isCapacityBlocked}
        />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: spacing.lg,
  },
  headerCard: {
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  collectionLabel: {
    fontSize: typography.size.caption,
    lineHeight: typography.lineHeight.caption,
    color: colors.brand.secondary,
    fontWeight: typography.weight.bold,
    textTransform: "uppercase",
    marginBottom: spacing.xxs,
  },
  title: {
    fontSize: typography.size.h2,
    lineHeight: typography.lineHeight.h2,
    fontWeight: typography.weight.bold,
    color: colors.neutral.textPrimary,
  },
  subtitle: {
    color: colors.neutral.textSecondary,
    marginTop: spacing.xxs,
    fontSize: typography.size.label,
    lineHeight: typography.lineHeight.label,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
    marginTop: spacing.md,
  },
  statItem: {
    width: "30%",
    minWidth: 90,
    backgroundColor: colors.brand.background,
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  statLabel: {
    color: colors.neutral.textSecondary,
    fontSize: typography.size.caption,
    lineHeight: typography.lineHeight.caption,
    textTransform: "uppercase",
    fontWeight: typography.weight.bold,
  },
  statValue: {
    marginTop: spacing.xxs,
    color: colors.neutral.textPrimary,
    fontWeight: typography.weight.bold,
    fontSize: typography.size.body,
    lineHeight: typography.lineHeight.body,
  },
  referenceHint: {
    marginTop: spacing.sm,
    fontSize: typography.size.caption,
    lineHeight: typography.lineHeight.caption,
    color: colors.neutral.textSecondary,
  },
  sectionHeaderRow: {
    marginTop: spacing.md,
    marginBottom: spacing.xs,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: {
    fontWeight: typography.weight.bold,
    color: colors.neutral.textPrimary,
    fontSize: typography.size.body,
    lineHeight: typography.lineHeight.body,
  },
  sectionCard: {
    marginBottom: spacing.sm,
  },
  inlineAction: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xxs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.brand.secondary,
    backgroundColor: colors.brand.background,
  },
  inlineActionText: {
    color: colors.brand.secondary,
    fontSize: typography.size.caption,
    fontWeight: typography.weight.medium,
  },
  helperText: {
    marginTop: spacing.xxs,
    marginBottom: spacing.sm,
    color: colors.neutral.textSecondary,
    fontSize: typography.size.caption,
    lineHeight: typography.lineHeight.caption,
  },
  fieldLabel: {
    marginTop: spacing.xs,
    marginBottom: spacing.xxs,
    color: colors.neutral.textPrimary,
    fontSize: typography.size.label,
    lineHeight: typography.lineHeight.label,
    fontWeight: typography.weight.medium,
  },
  textInput: {
    borderWidth: 1,
    borderColor: colors.neutral.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    color: colors.neutral.textPrimary,
    fontSize: typography.size.body,
    lineHeight: typography.lineHeight.body,
  },
  toggleRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
  },
  toggleChip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    backgroundColor: colors.neutral.white,
  },
  toggleChipActive: {
    borderColor: colors.brand.secondary,
    backgroundColor: colors.brand.background,
  },
  toggleChipText: {
    color: colors.neutral.textSecondary,
    fontSize: typography.size.caption,
    lineHeight: typography.lineHeight.caption,
    fontWeight: typography.weight.medium,
  },
  toggleChipTextActive: {
    color: colors.brand.secondary,
  },
  choiceWrap: {
    marginTop: spacing.xs,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
  },
  choiceChip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.neutral.border,
  },
  choiceChipActive: {
    borderColor: colors.brand.secondary,
    backgroundColor: colors.brand.background,
  },
  choiceChipText: {
    color: colors.neutral.textSecondary,
    fontSize: typography.size.caption,
    lineHeight: typography.lineHeight.caption,
  },
  choiceChipTextActive: {
    color: colors.brand.secondary,
    fontWeight: typography.weight.bold,
  },
  warningBox: {
    marginTop: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.semantic.error,
    backgroundColor: colors.state.errorBackground,
    padding: spacing.sm,
  },
  warningTitle: {
    color: colors.semantic.error,
    fontSize: typography.size.label,
    lineHeight: typography.lineHeight.label,
    fontWeight: typography.weight.bold,
  },
  warningText: {
    marginTop: spacing.xxs,
    color: colors.semantic.error,
    fontSize: typography.size.caption,
    lineHeight: typography.lineHeight.caption,
  },
  emptyText: {
    color: colors.neutral.textSecondary,
    fontSize: typography.size.label,
    lineHeight: typography.lineHeight.label,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.neutral.border,
  },
  listItemMainPressable: {
    flex: 1,
  },
  listItemMain: {
    flex: 1,
    paddingRight: spacing.xs,
  },
  listItemTitle: {
    fontWeight: typography.weight.bold,
    color: colors.neutral.textPrimary,
    fontSize: typography.size.body,
    lineHeight: typography.lineHeight.body,
  },
  listItemMeta: {
    marginTop: spacing.xxs,
    color: colors.neutral.muted,
    fontSize: typography.size.caption,
    lineHeight: typography.lineHeight.caption,
  },
  listItemNotes: {
    marginTop: spacing.xxs,
    color: colors.neutral.textSecondary,
    fontSize: typography.size.caption,
    lineHeight: typography.lineHeight.caption,
  },
  addActionButton: {
    marginLeft: spacing.xs,
    padding: spacing.xxs,
  },
  groupBlock: {
    marginTop: spacing.sm,
  },
  groupTitle: {
    fontSize: typography.size.label,
    lineHeight: typography.lineHeight.label,
    fontWeight: typography.weight.bold,
    color: colors.neutral.textSecondary,
    marginBottom: spacing.xxs,
  },
  cartRow: {
    marginTop: spacing.xs,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cartRowLabel: {
    color: colors.neutral.textPrimary,
    fontSize: typography.size.label,
    lineHeight: typography.lineHeight.label,
    flex: 1,
    marginRight: spacing.sm,
  },
  cartRowValue: {
    color: colors.brand.secondary,
    fontSize: typography.size.label,
    lineHeight: typography.lineHeight.label,
    fontWeight: typography.weight.bold,
  },
  compatibilityCard: {
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.brand.background,
    borderWidth: 1,
    borderColor: colors.brand.secondary,
    padding: spacing.sm,
  },
  compatibilityTitle: {
    color: colors.brand.secondary,
    fontSize: typography.size.label,
    lineHeight: typography.lineHeight.label,
    fontWeight: typography.weight.bold,
  },
  compatibilitySubtitle: {
    marginTop: spacing.xxs,
    color: colors.neutral.textSecondary,
    fontSize: typography.size.caption,
    lineHeight: typography.lineHeight.caption,
  },
  metricRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.xs,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.neutral.border,
  },
  metricLabel: {
    color: colors.neutral.textPrimary,
    fontSize: typography.size.label,
    lineHeight: typography.lineHeight.label,
  },
  metricValue: {
    color: colors.neutral.textSecondary,
    fontSize: typography.size.caption,
    lineHeight: typography.lineHeight.caption,
  },
  stepRow: {
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.neutral.border,
  },
  stepHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  stepTitle: {
    fontWeight: typography.weight.bold,
    color: colors.neutral.textPrimary,
    flex: 1,
    marginRight: spacing.xs,
    fontSize: typography.size.body,
    lineHeight: typography.lineHeight.body,
  },
  stepType: {
    color: colors.neutral.textSecondary,
    fontSize: typography.size.caption,
    lineHeight: typography.lineHeight.caption,
    textTransform: "uppercase",
    fontWeight: typography.weight.bold,
    backgroundColor: colors.brand.background,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
  },
  stepDescription: {
    marginTop: spacing.sm,
    color: colors.neutral.textSecondary,
    fontSize: typography.size.label,
    lineHeight: typography.lineHeight.label,
  },
  phaseRow: {
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.neutral.border,
  },
  phaseTitle: {
    color: colors.neutral.textPrimary,
    fontSize: typography.size.label,
    lineHeight: typography.lineHeight.label,
    fontWeight: typography.weight.bold,
  },
  phaseDetails: {
    marginTop: spacing.xxs,
    color: colors.neutral.textSecondary,
    fontSize: typography.size.caption,
    lineHeight: typography.lineHeight.caption,
  },
  compactStat: {
    color: colors.neutral.textPrimary,
    fontSize: typography.size.label,
    lineHeight: typography.lineHeight.label,
    marginBottom: spacing.xxs,
  },
  compactHint: {
    marginTop: spacing.xs,
    color: colors.neutral.textSecondary,
    fontSize: typography.size.caption,
    lineHeight: typography.lineHeight.caption,
  },
});
