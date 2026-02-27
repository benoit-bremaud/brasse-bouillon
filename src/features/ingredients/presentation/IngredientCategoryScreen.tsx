import { colors, radius, spacing, typography } from "@/core/theme";
import {
  Ingredient,
  IngredientCategory,
  IngredientFilters,
} from "@/features/ingredients/domain/ingredient.types";
import {
  MaltFilters,
  MaltProduct,
} from "@/features/ingredients/domain/malt.types";
import {
  getIngredientCategoryPageTitle,
  ingredientCategoryPresentationById,
} from "@/features/ingredients/presentation/ingredient-category.presentation";
import React, { useMemo, useState } from "react";
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { getErrorMessage } from "@/core/http/http-error";
import { normalizeRouteParam } from "@/core/navigation/route-params";
import { Card } from "@/core/ui/Card";
import { EmptyStateCard } from "@/core/ui/EmptyStateCard";
import { ListHeader } from "@/core/ui/ListHeader";
import { Screen } from "@/core/ui/Screen";
import { listIngredientsByCategory } from "@/features/ingredients/application/ingredients.use-cases";
import { listMalts } from "@/features/ingredients/application/malts.use-cases";
import { isIngredientCategory } from "@/features/ingredients/presentation/ingredient-category.constants";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";

type Props = {
  categoryParam?: string | string[];
  searchParam?: string | string[];
  ebcMinParam?: string | string[];
  ebcMaxParam?: string | string[];
};

type IngredientListItem = Ingredient | MaltProduct;

function toOptionalNumber(value: string): number | undefined {
  if (!value.trim()) {
    return undefined;
  }
  const parsed = Number(value);
  return Number.isNaN(parsed) ? undefined : parsed;
}

function getMaltColorEbcValue(item: MaltProduct): string | null {
  for (const group of item.specGroups) {
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

function isMaltProduct(item: IngredientListItem): item is MaltProduct {
  return "specGroups" in item;
}

function getIngredientMeta(item: IngredientListItem): string {
  if (isMaltProduct(item)) {
    const colorEbc = getMaltColorEbcValue(item);
    return `Type: ${item.maltType ?? "Unknown"} • EBC: ${colorEbc ?? "N/A"}`;
  }

  if (item.category === "malt") {
    return `Type: ${item.maltType} • EBC: ${item.ebc}`;
  }
  if (item.category === "hop") {
    return `Usage: ${item.hopUse} • Alpha: ${item.alphaAcid}%`;
  }
  return `Type: ${item.yeastType} • Atténuation: ${item.attenuationMin}-${item.attenuationMax}%`;
}

export function IngredientCategoryScreen({
  categoryParam,
  searchParam,
  ebcMinParam,
  ebcMaxParam,
}: Props) {
  const router = useRouter();
  const normalizedCategory = normalizeRouteParam(categoryParam) ?? "";
  const normalizedSearchParam = normalizeRouteParam(searchParam) ?? "";
  const normalizedEbcMinParam = normalizeRouteParam(ebcMinParam) ?? "";
  const normalizedEbcMaxParam = normalizeRouteParam(ebcMaxParam) ?? "";
  const category: IngredientCategory | null = isIngredientCategory(
    normalizedCategory,
  )
    ? normalizedCategory
    : null;

  const [search, setSearch] = useState(normalizedSearchParam);
  const [ebcMin, setEbcMin] = useState(normalizedEbcMinParam);
  const [ebcMax, setEbcMax] = useState(normalizedEbcMaxParam);
  const [alphaMin, setAlphaMin] = useState("");
  const [attenuationMin, setAttenuationMin] = useState("");

  const ingredientFilters = useMemo<IngredientFilters>(() => {
    const commonFilters: IngredientFilters = {
      search,
    };

    if (category === "hop") {
      return {
        ...commonFilters,
        alphaAcidMin: toOptionalNumber(alphaMin),
      };
    }

    if (category === "yeast") {
      return {
        ...commonFilters,
        attenuationMin: toOptionalNumber(attenuationMin),
      };
    }

    return commonFilters;
  }, [alphaMin, attenuationMin, category, ebcMax, ebcMin, search]);

  const maltFilters = useMemo<MaltFilters>(
    () => ({
      search,
      colorEbcMin: toOptionalNumber(ebcMin),
      colorEbcMax: toOptionalNumber(ebcMax),
    }),
    [ebcMax, ebcMin, search],
  );

  const {
    data: ingredients = [],
    isLoading,
    isFetching,
    isFetched,
    error: queryError,
    refetch,
  } = useQuery<IngredientListItem[]>({
    queryKey: [
      "ingredients",
      "category",
      category,
      category === "malt" ? maltFilters : ingredientFilters,
    ],
    queryFn: () => {
      if (!category) {
        return Promise.resolve([]);
      }

      if (category === "malt") {
        return listMalts(maltFilters);
      }

      return listIngredientsByCategory(category, ingredientFilters);
    },
    enabled: Boolean(category),
  });

  const error = queryError
    ? isFetching
      ? null
      : getErrorMessage(queryError, "Unable to load ingredients")
    : null;

  if (!category) {
    return (
      <Screen>
        <EmptyStateCard
          title="Catégorie inconnue"
          description="Cette catégorie d'ingrédients n'existe pas."
        />
      </Screen>
    );
  }

  const showEmptyState = isFetched && !isLoading && ingredients.length === 0;
  const isRetryingWithError = isFetching && Boolean(queryError);
  const numericInputProps = {
    keyboardType: "decimal-pad" as const,
    autoCorrect: false,
    autoCapitalize: "none" as const,
  };

  const presentation = ingredientCategoryPresentationById[category];
  const categoryPageTitle = getIngredientCategoryPageTitle(category);

  const navigateToIngredientDetails = (ingredient: IngredientListItem) => {
    if (isMaltProduct(ingredient) || ingredient.category === "malt") {
      const trimmedSearch = search.trim();
      const trimmedEbcMin = ebcMin.trim();
      const trimmedEbcMax = ebcMax.trim();

      router.push({
        pathname: "/(app)/ingredients/malts/[id]",
        params: {
          id: ingredient.id,
          returnTo: "/(app)/ingredients/[category]",
          returnCategory: "malt",
          returnSearch: trimmedSearch || undefined,
          returnEbcMin: trimmedEbcMin || undefined,
          returnEbcMax: trimmedEbcMax || undefined,
        },
      });
      return;
    }

    router.push({
      pathname: "/(app)/ingredients/[category]/[id]",
      params: { category: ingredient.category, id: ingredient.id },
    });
  };

  return (
    <Screen
      isLoading={(isLoading && ingredients.length === 0) || isRetryingWithError}
      error={error}
      onRetry={() => {
        void refetch();
      }}
    >
      <ListHeader
        title={categoryPageTitle}
        subtitle="Recherche et filtres rapides"
        action={
          <View
            style={[
              styles.headerCategoryIcon,
              { backgroundColor: presentation.iconColor + "20" },
            ]}
            accessible={false}
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
          >
            <Ionicons
              name={presentation.iconName}
              size={20}
              color={presentation.iconColor}
            />
          </View>
        }
      />

      <Card style={styles.filtersCard}>
        <Text style={styles.filterLabel}>Recherche</Text>
        <TextInput
          accessibilityLabel="Search ingredient by name"
          value={search}
          onChangeText={setSearch}
          placeholder="Nom de l'ingrédient"
          placeholderTextColor={colors.neutral.muted}
          style={styles.input}
          autoCorrect={false}
          autoCapitalize="none"
        />

        {category === "malt" ? (
          <View style={styles.row}>
            <View style={styles.field}>
              <Text style={styles.filterLabel}>EBC min</Text>
              <TextInput
                accessibilityLabel="EBC min"
                value={ebcMin}
                onChangeText={setEbcMin}
                style={styles.input}
                {...numericInputProps}
              />
            </View>
            <View style={styles.field}>
              <Text style={styles.filterLabel}>EBC max</Text>
              <TextInput
                accessibilityLabel="EBC max"
                value={ebcMax}
                onChangeText={setEbcMax}
                style={styles.input}
                {...numericInputProps}
              />
            </View>
          </View>
        ) : null}

        {category === "hop" ? (
          <View style={styles.field}>
            <Text style={styles.filterLabel}>Acides alpha min (%)</Text>
            <TextInput
              accessibilityLabel="Acides alpha min (%)"
              value={alphaMin}
              onChangeText={setAlphaMin}
              style={styles.input}
              {...numericInputProps}
            />
          </View>
        ) : null}

        {category === "yeast" ? (
          <View style={styles.field}>
            <Text style={styles.filterLabel}>Atténuation min (%)</Text>
            <TextInput
              accessibilityLabel="Atténuation min (%)"
              value={attenuationMin}
              onChangeText={setAttenuationMin}
              style={styles.input}
              {...numericInputProps}
            />
          </View>
        ) : null}
      </Card>

      {showEmptyState ? (
        <EmptyStateCard
          title="Aucun ingrédient trouvé"
          description="Élargissez la recherche ou les filtres."
        />
      ) : null}

      <FlatList
        data={ingredients}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Voir la fiche ${item.name}`}
            onPress={() => navigateToIngredientDetails(item)}
          >
            <Card style={styles.itemCard}>
              <View style={styles.cardContent}>
                <View
                  style={[
                    styles.itemIcon,
                    { backgroundColor: presentation.iconColor + "25" },
                  ]}
                >
                  <Ionicons
                    name={presentation.iconName}
                    size={20}
                    color={presentation.iconColor}
                  />
                </View>
                <View style={styles.cardInfo}>
                  <Text style={styles.itemTitle}>{item.name}</Text>
                  <Text style={styles.itemMeta}>{getIngredientMeta(item)}</Text>
                  {isMaltProduct(item) ? (
                    item.originCountry ? (
                      <Text style={styles.itemSecondary}>
                        Origine : {item.originCountry}
                      </Text>
                    ) : null
                  ) : item.origin ? (
                    <Text style={styles.itemSecondary}>
                      Origine : {item.origin}
                    </Text>
                  ) : null}
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={colors.neutral.muted}
                />
              </View>
            </Card>
          </Pressable>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  headerCategoryIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    justifyContent: "center",
    alignItems: "center",
  },
  filtersCard: {
    marginBottom: spacing.sm,
  },
  row: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  field: {
    flex: 1,
  },
  filterLabel: {
    color: colors.neutral.textSecondary,
    fontSize: typography.size.caption,
    lineHeight: typography.lineHeight.caption,
    fontWeight: typography.weight.medium,
    marginBottom: spacing.xxs,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.neutral.border,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    color: colors.neutral.textPrimary,
    marginBottom: spacing.xs,
  },
  list: {
    paddingBottom: spacing.md,
  },
  itemCard: {
    marginBottom: spacing.sm,
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  itemIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    justifyContent: "center",
    alignItems: "center",
  },
  cardInfo: {
    flex: 1,
  },
  itemTitle: {
    color: colors.neutral.textPrimary,
    fontSize: typography.size.body,
    lineHeight: typography.lineHeight.body,
    fontWeight: typography.weight.medium,
  },
  itemMeta: {
    marginTop: spacing.xxs,
    color: colors.neutral.textSecondary,
    fontSize: typography.size.label,
    lineHeight: typography.lineHeight.label,
  },
  itemSecondary: {
    marginTop: spacing.xxs,
    color: colors.neutral.muted,
    fontSize: typography.size.caption,
    lineHeight: typography.lineHeight.caption,
  },
});
