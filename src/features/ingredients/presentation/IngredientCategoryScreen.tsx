import { colors, radius, spacing, typography } from "@/core/theme";
import {
  Ingredient,
  IngredientCategory,
  IngredientFilters,
  ingredientCategoryLabels,
  isIngredientCategory,
} from "@/features/ingredients/domain/ingredient.types";
import React, { useEffect, useMemo, useState } from "react";
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { getErrorMessage } from "@/core/http/http-error";
import { Card } from "@/core/ui/Card";
import { EmptyStateCard } from "@/core/ui/EmptyStateCard";
import { ListHeader } from "@/core/ui/ListHeader";
import { Screen } from "@/core/ui/Screen";
import { listIngredientsByCategory } from "@/features/ingredients/application/ingredients.use-cases";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

type Props = {
  categoryParam?: string;
};

function toOptionalNumber(value: string): number | undefined {
  if (!value.trim()) {
    return undefined;
  }
  const parsed = Number(value);
  return Number.isNaN(parsed) ? undefined : parsed;
}

function getIngredientMeta(item: Ingredient): string {
  if (item.category === "malt") {
    return `Type: ${item.maltType} • EBC: ${item.ebc}`;
  }
  if (item.category === "hop") {
    return `Usage: ${item.hopUse} • Alpha: ${item.alphaAcid}%`;
  }
  return `Type: ${item.yeastType} • Atténuation: ${item.attenuationMin}-${item.attenuationMax}%`;
}

function getIngredientIconColor(category: IngredientCategory): string {
  if (category === "malt") return colors.brand.primary;
  if (category === "hop") return colors.semantic.success;
  return colors.brand.secondary;
}

function getIngredientIconName(
  category: IngredientCategory,
): keyof typeof Ionicons.glyphMap {
  if (category === "malt") return "nutrition-outline";
  if (category === "hop") return "leaf-outline";
  return "flask-outline";
}

export function IngredientCategoryScreen({ categoryParam }: Props) {
  const router = useRouter();
  const normalizedCategory = categoryParam ?? "";
  const category: IngredientCategory | null = isIngredientCategory(
    normalizedCategory,
  )
    ? normalizedCategory
    : null;

  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [search, setSearch] = useState("");
  const [ebcMin, setEbcMin] = useState("");
  const [ebcMax, setEbcMax] = useState("");
  const [alphaMin, setAlphaMin] = useState("");
  const [attenuationMin, setAttenuationMin] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filters = useMemo<IngredientFilters>(() => {
    const common: IngredientFilters = {
      search,
    };

    if (category === "malt") {
      return {
        ...common,
        ebcMin: toOptionalNumber(ebcMin),
        ebcMax: toOptionalNumber(ebcMax),
      };
    }

    if (category === "hop") {
      return {
        ...common,
        alphaAcidMin: toOptionalNumber(alphaMin),
      };
    }

    if (category === "yeast") {
      return {
        ...common,
        attenuationMin: toOptionalNumber(attenuationMin),
      };
    }

    return common;
  }, [alphaMin, attenuationMin, category, ebcMax, ebcMin, search]);

  const fetchIngredients = async () => {
    if (!category) {
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const data = await listIngredientsByCategory(category, filters);
      setIngredients(data);
    } catch (err) {
      setError(getErrorMessage(err, "Unable to load ingredients"));
    } finally {
      setIsLoading(false);
      setHasFetched(true);
    }
  };

  useEffect(() => {
    fetchIngredients();
  }, [category, filters]);

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

  const showEmptyState = hasFetched && !isLoading && ingredients.length === 0;
  const numericInputProps = {
    keyboardType: "decimal-pad" as const,
    autoCorrect: false,
    autoCapitalize: "none" as const,
  };

  const iconColor = getIngredientIconColor(category);
  const iconName = getIngredientIconName(category);

  return (
    <Screen
      isLoading={isLoading && ingredients.length === 0}
      error={error}
      onRetry={fetchIngredients}
    >
      <ListHeader
        title={ingredientCategoryLabels[category]}
        subtitle="Recherche et filtres rapides"
      />

      <Card style={styles.filtersCard}>
        <Text style={styles.filterLabel}>Recherche</Text>
        <TextInput
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
                value={ebcMin}
                onChangeText={setEbcMin}
                style={styles.input}
                {...numericInputProps}
              />
            </View>
            <View style={styles.field}>
              <Text style={styles.filterLabel}>EBC max</Text>
              <TextInput
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
            onPress={() =>
              router.push({
                pathname: "/(app)/ingredients/[category]/[id]",
                params: { category, id: item.id },
              })
            }
          >
            <Card style={styles.itemCard}>
              <View style={styles.cardContent}>
                <View
                  style={[
                    styles.itemIcon,
                    { backgroundColor: iconColor + "25" },
                  ]}
                >
                  <Ionicons name={iconName} size={20} color={iconColor} />
                </View>
                <View style={styles.cardInfo}>
                  <Text style={styles.itemTitle}>{item.name}</Text>
                  <Text style={styles.itemMeta}>{getIngredientMeta(item)}</Text>
                  {item.origin ? (
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
