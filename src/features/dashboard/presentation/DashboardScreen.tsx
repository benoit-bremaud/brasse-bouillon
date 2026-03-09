import { colors, radius, spacing, typography } from "@/core/theme";
import { Href, useRouter } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useAuth } from "@/core/auth/auth-context";
import { dataSource } from "@/core/data/data-source";
import { getErrorMessage } from "@/core/http/http-error";
import { Card } from "@/core/ui/Card";
import { Screen } from "@/core/ui/Screen";
import { listBatches } from "@/features/batches/application/batches.use-cases";
import { BatchSummary } from "@/features/batches/domain/batch.types";
import { listRecipes } from "@/features/recipes/application/recipes.use-cases";
import { Recipe } from "@/features/recipes/domain/recipe.types";
import { academyTopics } from "@/features/tools/data";
import { demoIngredients } from "@/mocks/demo-data";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";

// Time constants.
const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;

// Brewing defaults.
const FERMENTATION_DAYS = 7;
const BOTTLING_DAYS = 10;
const MIN_RECIPE_INGREDIENTS = 3;

type PeriodKey = "year" | "90d" | "30d";
type AlertStatus = "Bientôt" | "Urgent" | "En retard";

type DashboardAlert = {
  id: string;
  batchId: string;
  batchName: string;
  currentStepLabel: string;
  nextStepLabel: string;
  dueAt: Date;
  status: AlertStatus;
  isCriticalQuality: boolean;
};

type NavigationCard = {
  id: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  href: Href;
  metric: string;
  status: string;
  color: string;
};

type IngredientsMetric = {
  metric: string;
  status: string;
};

type MoreSectionCategory = "business" | "account";

type MoreSectionItem = {
  id: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  href?: Href;
  type: "route" | "profile";
  category: MoreSectionCategory;
};

type MoreSectionConfig = {
  title: string;
  items: MoreSectionItem[];
};

type BrewStepConfig = {
  label: string;
  expectedHours: number;
  isCriticalQuality: boolean;
};

type TimelineStep = {
  label: string;
  state: "past" | "current" | "next";
};

const PERIOD_OPTIONS: Array<{ id: PeriodKey; label: string }> = [
  { id: "year", label: "Année" },
  { id: "90d", label: "90 jours" },
  { id: "30d", label: "30 jours" },
];

const BREWING_STEPS: BrewStepConfig[] = [
  { label: "Empâtage", expectedHours: 2, isCriticalQuality: false },
  { label: "Ébullition", expectedHours: 8, isCriticalQuality: false },
  { label: "Fermentation", expectedHours: 24, isCriticalQuality: true },
  {
    label: "Conditionnement",
    expectedHours: FERMENTATION_DAYS * 24,
    isCriticalQuality: true,
  },
  {
    label: "Embouteillage",
    expectedHours: BOTTLING_DAYS * 24,
    isCriticalQuality: true,
  },
];

const TOP_NAVIGATION_IDS = ["batches", "recipes", "ingredients", "tools"];

const MORE_BUSINESS_SECTIONS: MoreSectionItem[] = [
  {
    id: "scan",
    label: "Scanner",
    icon: "qr-code-outline",
    href: "/(app)/dashboard/scan",
    type: "route",
    category: "business",
  },
  {
    id: "labels",
    label: "Mes étiquettes",
    icon: "pricetags-outline",
    href: "/(app)/dashboard/labels",
    type: "route",
    category: "business",
  },
  {
    id: "equipment",
    label: "Équipements",
    icon: "construct-outline",
    href: "/(app)/equipment",
    type: "route",
    category: "business",
  },
  {
    id: "explore",
    label: "Explore",
    icon: "compass-outline",
    href: "/(app)/explore",
    type: "route",
    category: "business",
  },
  {
    id: "academy",
    label: "Académie",
    icon: "school-outline",
    href: "/(app)/academy",
    type: "route",
    category: "business",
  },
  {
    id: "shop",
    label: "Boutique",
    icon: "cart-outline",
    href: "/(app)/shop",
    type: "route",
    category: "business",
  },
];

const MORE_ACCOUNT_SECTIONS: MoreSectionItem[] = [
  {
    id: "profile",
    label: "Profil",
    icon: "person-circle-outline",
    type: "profile",
    category: "account",
  },
  {
    id: "settings",
    label: "Paramètres globaux",
    icon: "settings-outline",
    type: "profile",
    category: "account",
  },
];

const MORE_SECTION_CONFIGS: MoreSectionConfig[] = [
  {
    title: "Sections métier",
    items: MORE_BUSINESS_SECTIONS,
  },
  {
    title: "Compte",
    items: MORE_ACCOUNT_SECTIONS,
  },
];

function renderMoreSectionItem(
  item: MoreSectionItem,
  onPress: (item: MoreSectionItem) => void,
) {
  return (
    <Pressable
      key={`${item.category}-${item.id}`}
      accessibilityRole="button"
      accessibilityLabel={`Ouvrir ${item.label}`}
      onPress={() => onPress(item)}
      style={({ pressed }) => [styles.sheetItem, pressed && styles.pressed]}
    >
      <Ionicons name={item.icon} size={18} color={colors.brand.secondary} />
      <Text style={styles.sheetItemLabel}>{item.label}</Text>
      <Ionicons name="chevron-forward" size={16} color={colors.neutral.muted} />
    </Pressable>
  );
}

const ALERT_STATUS_PRIORITY: Record<AlertStatus, number> = {
  "En retard": 0,
  Urgent: 1,
  Bientôt: 2,
};

function parseDateOrNow(value: string, fallback: Date): Date {
  const parsed = Date.parse(value);
  if (!Number.isNaN(parsed)) {
    return new Date(parsed);
  }

  if (!Number.isNaN(fallback.getTime())) {
    return fallback;
  }

  return new Date();
}

function clampStepIndex(stepOrder?: number | null): number {
  if (
    stepOrder === null ||
    stepOrder === undefined ||
    Number.isNaN(stepOrder)
  ) {
    return 0;
  }

  const normalized = Math.round(stepOrder);
  return Math.min(Math.max(normalized, 0), BREWING_STEPS.length - 1);
}

function getAlertStatus(dueAt: Date, now: Date): AlertStatus {
  const timeUntilDue = dueAt.getTime() - now.getTime();
  if (timeUntilDue < 0) {
    return "En retard";
  }
  if (timeUntilDue <= 8 * HOUR_MS) {
    return "Urgent";
  }
  return "Bientôt";
}

function formatRelativeDue(dueAt: Date, now: Date): string {
  const diff = dueAt.getTime() - now.getTime();

  if (diff < 0) {
    const lateHours = Math.max(1, Math.round(Math.abs(diff) / HOUR_MS));
    return `En retard de ${lateHours}h`;
  }

  if (diff < HOUR_MS) {
    return "Dans moins de 1h";
  }

  if (diff < DAY_MS) {
    return `Dans ${Math.round(diff / HOUR_MS)}h`;
  }

  return `Dans ${Math.round(diff / DAY_MS)}j`;
}

function isWithinSelectedPeriod(
  isoDate: string,
  period: PeriodKey,
  now: Date,
): boolean {
  const parsed = Date.parse(isoDate);
  if (Number.isNaN(parsed)) {
    return false;
  }

  const date = new Date(parsed);
  if (period === "year") {
    return date.getUTCFullYear() === now.getUTCFullYear();
  }

  const numberOfDays = period === "90d" ? 90 : 30;
  const threshold = new Date(now);
  threshold.setDate(now.getDate() - numberOfDays);

  return date >= threshold;
}

function isRecipeDraft(recipe: Recipe): boolean {
  const ingredientCount = recipe.ingredients?.length ?? 0;
  const hasStats = Boolean(recipe.stats);
  return ingredientCount < MIN_RECIPE_INGREDIENTS || !hasStats;
}

function getDueAtForCurrentStep(startedAt: Date, stepIndex: number): Date {
  const totalExpectedHours = BREWING_STEPS.slice(0, stepIndex + 1).reduce(
    (total, step) => total + step.expectedHours,
    0,
  );

  return new Date(startedAt.getTime() + totalExpectedHours * HOUR_MS);
}

function buildBatchAlert(
  batch: BatchSummary,
  now: Date,
): DashboardAlert | null {
  if (batch.status !== "in_progress") {
    return null;
  }

  const stepIndex = clampStepIndex(batch.currentStepOrder);
  const currentStep = BREWING_STEPS[stepIndex];
  const nextStep = BREWING_STEPS[stepIndex + 1];
  const startedAt = parseDateOrNow(batch.startedAt, now);
  const dueAt = getDueAtForCurrentStep(startedAt, stepIndex);

  return {
    id: `${batch.id}-${currentStep.label}`,
    batchId: batch.id,
    batchName: `Brassin #${batch.id.slice(0, 6)}`,
    currentStepLabel: currentStep.label,
    nextStepLabel: nextStep?.label ?? "Finalisation",
    dueAt,
    status: getAlertStatus(dueAt, now),
    isCriticalQuality: currentStep.isCriticalQuality,
  };
}

function getTimelineSteps(stepOrder?: number | null): TimelineStep[] {
  const stepIndex = clampStepIndex(stepOrder);
  const previousLabel =
    stepIndex > 0 ? BREWING_STEPS[stepIndex - 1].label : "Préparation";
  const currentLabel = BREWING_STEPS[stepIndex].label;
  const nextLabel = BREWING_STEPS[stepIndex + 1]?.label ?? "Finalisation";

  return [
    { label: previousLabel, state: "past" },
    { label: currentLabel, state: "current" },
    { label: nextLabel, state: "next" },
  ];
}

function getStatusColors(status: string): {
  background: string;
  foreground: string;
} {
  if (status === "En retard") {
    return {
      background: colors.semantic.error + "20",
      foreground: colors.semantic.error,
    };
  }

  if (status === "Urgent") {
    return {
      background: colors.semantic.warning + "30",
      foreground: colors.semantic.error,
    };
  }

  if (status === "Bientôt") {
    return {
      background: colors.semantic.success + "20",
      foreground: colors.semantic.success,
    };
  }

  return {
    background: colors.neutral.border,
    foreground: colors.neutral.textSecondary,
  };
}

export function DashboardScreen() {
  const router = useRouter();
  const { session } = useAuth();
  const isUsingDemoData = dataSource.useDemoData;

  const [selectedPeriod, setSelectedPeriod] = useState<PeriodKey>("year");
  const [isMoreSheetVisible, setIsMoreSheetVisible] = useState(false);

  const {
    data: recipes = [],
    isLoading: isRecipesLoading,
    isFetching: isRecipesFetching,
    error: recipesError,
    refetch: refetchRecipes,
  } = useQuery<Recipe[]>({
    queryKey: ["recipes", "list"],
    queryFn: listRecipes,
  });

  const {
    data: batches = [],
    isLoading: isBatchesLoading,
    isFetching: isBatchesFetching,
    error: batchesError,
    refetch: refetchBatches,
  } = useQuery<BatchSummary[]>({
    queryKey: ["batches", "list"],
    queryFn: listBatches,
  });

  const queryError = recipesError ?? batchesError;
  const isFetching = isRecipesFetching || isBatchesFetching;
  const isLoading =
    isRecipesLoading || isBatchesLoading || (isFetching && Boolean(queryError));
  const error = queryError
    ? isFetching
      ? null
      : getErrorMessage(queryError, "Impossible de charger le dashboard")
    : null;

  const handleRetry = useCallback(() => {
    void refetchRecipes();
    void refetchBatches();
  }, [refetchBatches, refetchRecipes]);

  const [referenceDate] = useState(() => new Date());

  const displayName =
    session?.user.firstName ||
    session?.user.username ||
    session?.user.email?.split("@")[0] ||
    "Brasseur";

  const activeBatches = useMemo(
    () => batches.filter((batch) => batch.status === "in_progress"),
    [batches],
  );

  const alerts = useMemo(
    () =>
      activeBatches
        .map((batch) => buildBatchAlert(batch, referenceDate))
        .filter((alert): alert is DashboardAlert => Boolean(alert))
        .sort((a, b) => {
          if (a.isCriticalQuality !== b.isCriticalQuality) {
            return a.isCriticalQuality ? -1 : 1;
          }

          if (a.status !== b.status) {
            return (
              ALERT_STATUS_PRIORITY[a.status] - ALERT_STATUS_PRIORITY[b.status]
            );
          }

          return a.dueAt.getTime() - b.dueAt.getTime();
        }),
    [activeBatches, referenceDate],
  );

  const filteredActiveBatches = useMemo(
    () =>
      activeBatches.filter((batch) =>
        isWithinSelectedPeriod(batch.startedAt, selectedPeriod, referenceDate),
      ),
    [activeBatches, referenceDate, selectedPeriod],
  );

  const filteredActiveBatchIds = useMemo(
    () => new Set(filteredActiveBatches.map((batch) => batch.id)),
    [filteredActiveBatches],
  );

  const filteredAlerts = useMemo(
    () => alerts.filter((alert) => filteredActiveBatchIds.has(alert.batchId)),
    [alerts, filteredActiveBatchIds],
  );

  const actionsDueCount = useMemo(
    () =>
      filteredAlerts.filter((alert) => {
        const diff = alert.dueAt.getTime() - referenceDate.getTime();
        return diff >= 0 && diff <= DAY_MS;
      }).length,
    [filteredAlerts, referenceDate],
  );

  const criticalAlertsCount = useMemo(
    () => filteredAlerts.filter((alert) => alert.isCriticalQuality).length,
    [filteredAlerts],
  );

  const filteredAlertsMap = useMemo(
    () => new Map(filteredAlerts.map((alert) => [alert.batchId, alert])),
    [filteredAlerts],
  );

  const sortedActiveBatches = useMemo(() => {
    const compareBatches = (batchA: BatchSummary, batchB: BatchSummary) => {
      const alertA = filteredAlertsMap.get(batchA.id);
      const alertB = filteredAlertsMap.get(batchB.id);

      if (!alertA && !alertB) {
        return 0;
      }
      if (!alertA) {
        return 1;
      }
      if (!alertB) {
        return -1;
      }

      if (alertA.isCriticalQuality !== alertB.isCriticalQuality) {
        return alertA.isCriticalQuality ? -1 : 1;
      }

      return alertA.dueAt.getTime() - alertB.dueAt.getTime();
    };

    return [...filteredActiveBatches].sort(compareBatches).slice(0, 2);
  }, [filteredActiveBatches, filteredAlertsMap]);

  const filteredRecipes = useMemo(
    () =>
      recipes.filter((recipe) =>
        isWithinSelectedPeriod(recipe.updatedAt, selectedPeriod, referenceDate),
      ),
    [recipes, referenceDate, selectedPeriod],
  );

  const draftRecipesCount = useMemo(
    () => filteredRecipes.filter(isRecipeDraft).length,
    [filteredRecipes],
  );

  const missingIngredientsCount = useMemo(() => {
    if (!isUsingDemoData) {
      return null;
    }

    const readyRecipes = filteredRecipes.filter(
      (recipe) => !isRecipeDraft(recipe),
    );
    const requiredIngredientIds = new Set(
      readyRecipes.flatMap((recipe) =>
        (recipe.ingredients ?? []).map((ingredient) => ingredient.ingredientId),
      ),
    );

    const availableIngredientIds = new Set(
      demoIngredients.map((ingredient) => ingredient.id),
    );

    return [...requiredIngredientIds].filter(
      (ingredientId) => !availableIngredientIds.has(ingredientId),
    ).length;
  }, [filteredRecipes, isUsingDemoData]);

  const ingredientsMetric = useMemo<IngredientsMetric>(() => {
    if (missingIngredientsCount === null) {
      return {
        metric: "Stock live",
        status: "Synchronisé",
      };
    }

    return {
      metric: `${missingIngredientsCount} manquant${
        missingIngredientsCount > 1 ? "s" : ""
      }`,
      status: missingIngredientsCount === 0 ? "Complet" : "Incomplet",
    };
  }, [missingIngredientsCount]);

  const favoriteToolsCount = academyTopics.filter(
    (topic) => topic.hasCalculator && topic.status === "ready",
  ).length;

  const highlightedAlert = filteredAlerts[0] ?? null;

  const navigationCards = useMemo<NavigationCard[]>(
    () => [
      {
        id: "batches",
        label: "Brassins",
        icon: "flask-outline",
        href: "/(app)/batches",
        metric: highlightedAlert
          ? formatRelativeDue(highlightedAlert.dueAt, referenceDate)
          : "Aucune échéance",
        status: highlightedAlert?.status ?? "OK",
        color: colors.brand.secondary,
      },
      {
        id: "recipes",
        label: "Recettes",
        icon: "book-outline",
        href: "/(app)/recipes",
        metric: `${draftRecipesCount} brouillon${draftRecipesCount > 1 ? "s" : ""}`,
        status: draftRecipesCount === 0 ? "Prêtes" : "À compléter",
        color: colors.brand.primary,
      },
      {
        id: "ingredients",
        label: "Ingrédients",
        icon: "leaf-outline",
        href: "/(app)/ingredients",
        metric: ingredientsMetric.metric,
        status: ingredientsMetric.status,
        color: colors.semantic.warning,
      },
      {
        id: "tools",
        label: "Outils",
        icon: "calculator-outline",
        href: "/(app)/tools",
        metric: `${favoriteToolsCount} favori${favoriteToolsCount > 1 ? "s" : ""}`,
        status: favoriteToolsCount > 0 ? "Configuré" : "À personnaliser",
        color: colors.semantic.info,
      },
    ],
    [
      draftRecipesCount,
      favoriteToolsCount,
      highlightedAlert,
      ingredientsMetric,
      referenceDate,
    ],
  );

  const topNavigationCards = navigationCards.filter((card) =>
    TOP_NAVIGATION_IDS.includes(card.id),
  );

  const handleOpenProfilePanel = useCallback(() => {
    setIsMoreSheetVisible(false);
    router.push("/(app)/profile");
  }, [router]);

  const handleMoreItemPress = useCallback(
    (item: MoreSectionItem) => {
      if (item.type === "profile") {
        handleOpenProfilePanel();
        return;
      }

      if (item.href) {
        setIsMoreSheetVisible(false);
        router.push(item.href);
      }
    },
    [handleOpenProfilePanel, router],
  );

  const kpis = useMemo(
    () => [
      {
        id: "active-batches",
        label: "Brassins actifs",
        value: `${filteredActiveBatches.length}`,
        icon: "flask-outline" as const,
        color: colors.brand.secondary,
      },
      {
        id: "due-actions",
        label: "Actions 24h",
        value: `${actionsDueCount}`,
        icon: "timer-outline" as const,
        color: colors.semantic.warning,
      },
      {
        id: "critical-alerts",
        label: "Alertes critiques",
        value: `${criticalAlertsCount}`,
        icon: "warning-outline" as const,
        color: colors.semantic.error,
      },
    ],
    [actionsDueCount, criticalAlertsCount, filteredActiveBatches.length],
  );

  return (
    <Screen isLoading={isLoading} error={error} onRetry={handleRetry}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerCard}>
          <View style={styles.headerIdentity}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {displayName.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View>
              <Text style={styles.headerName}>{displayName}</Text>
              <Text style={styles.headerSubtitle}>
                Tableau de bord brassage
              </Text>
            </View>
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Ouvrir le profil"
            onPress={handleOpenProfilePanel}
            style={({ pressed }) => [
              styles.profileButton,
              pressed && styles.pressed,
            ]}
          >
            <Ionicons
              name="person-circle-outline"
              size={18}
              color={colors.brand.secondary}
            />
            <Text style={styles.profileButtonText}>Profil</Text>
          </Pressable>
        </View>

        <Card style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Période d’analyse</Text>
          </View>

          <View style={styles.periodFilters}>
            {PERIOD_OPTIONS.map((option) => {
              const isSelected = selectedPeriod === option.id;

              return (
                <Pressable
                  key={option.id}
                  accessibilityRole="button"
                  accessibilityLabel={`Choisir la période ${option.label}`}
                  onPress={() => setSelectedPeriod(option.id)}
                  style={({ pressed }) => [
                    styles.periodChip,
                    isSelected && styles.periodChipSelected,
                    pressed && styles.pressed,
                  ]}
                >
                  <Text
                    style={[
                      styles.periodChipText,
                      isSelected && styles.periodChipTextSelected,
                    ]}
                  >
                    {option.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </Card>

        <Card style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Vue d’ensemble</Text>
          </View>

          <View style={styles.kpiRow}>
            {kpis.map((kpi) => (
              <View key={kpi.id} style={styles.kpiCard}>
                <View style={styles.kpiTopRow}>
                  <Ionicons name={kpi.icon} size={18} color={kpi.color} />
                  <Text style={styles.kpiValue}>{kpi.value}</Text>
                </View>
                <Text style={styles.kpiLabel}>{kpi.label}</Text>
              </View>
            ))}
          </View>
        </Card>

        <Card style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Alertes & échéances</Text>
            <Text style={styles.sectionMeta}>Temps réel</Text>
          </View>

          {filteredAlerts.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons
                name="checkmark-circle-outline"
                size={28}
                color={colors.semantic.success}
              />
              <Text style={styles.emptyStateText}>
                Aucune alerte sur la période
              </Text>
            </View>
          ) : (
            <View style={styles.alertsList}>
              {filteredAlerts.slice(0, 3).map((alert) => {
                const statusColors = getStatusColors(alert.status);

                return (
                  <View key={alert.id} style={styles.alertItem}>
                    <View style={styles.alertContent}>
                      <Text style={styles.alertBatchName}>
                        {alert.batchName}
                      </Text>
                      <Text style={styles.alertMetaText}>
                        {alert.currentStepLabel} → {alert.nextStepLabel}
                      </Text>
                      <Text style={styles.alertDueText}>
                        {formatRelativeDue(alert.dueAt, referenceDate)}
                      </Text>
                    </View>

                    <View style={styles.alertActions}>
                      <View
                        style={[
                          styles.statusPill,
                          { backgroundColor: statusColors.background },
                        ]}
                      >
                        <Text
                          style={[
                            styles.statusPillText,
                            { color: statusColors.foreground },
                          ]}
                        >
                          {alert.status}
                        </Text>
                      </View>

                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={`Ouvrir ${alert.batchName}`}
                        onPress={() =>
                          router.push(`/(app)/batches/${alert.batchId}`)
                        }
                        style={({ pressed }) => [
                          styles.openBatchButton,
                          pressed && styles.pressed,
                        ]}
                      >
                        <Text style={styles.openBatchButtonText}>
                          Ouvrir le brassin
                        </Text>
                      </Pressable>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </Card>

        <Card style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Brassins actifs</Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Voir tous les brassins"
              onPress={() => router.push("/(app)/batches")}
              style={({ pressed }) => [
                styles.linkButton,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.linkButtonText}>Voir tout</Text>
            </Pressable>
          </View>

          {sortedActiveBatches.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons
                name="flask-outline"
                size={28}
                color={colors.neutral.muted}
              />
              <Text style={styles.emptyStateText}>Aucun brassin actif</Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Choisir une recette à lancer"
                onPress={() => router.push("/(app)/recipes")}
                style={({ pressed }) => [
                  styles.emptyStateAction,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={styles.emptyStateActionText}>
                  Choisir une recette à lancer
                </Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.activeBatchesList}>
              {sortedActiveBatches.map((batch) => {
                const alert = filteredAlertsMap.get(batch.id) ?? null;
                const statusColors = getStatusColors(
                  alert?.status ?? "Bientôt",
                );
                const timeline = getTimelineSteps(batch.currentStepOrder);

                return (
                  <Pressable
                    key={batch.id}
                    accessibilityRole="button"
                    accessibilityLabel={`Ouvrir le ${
                      alert?.batchName ?? `brassin ${batch.id.slice(0, 6)}`
                    }`}
                    onPress={() => router.push(`/(app)/batches/${batch.id}`)}
                    style={({ pressed }) => [
                      styles.activeBatchItem,
                      pressed && styles.pressed,
                    ]}
                  >
                    <View style={styles.activeBatchHeader}>
                      <Text style={styles.activeBatchTitle}>
                        {alert?.batchName ?? `Brassin #${batch.id.slice(0, 6)}`}
                      </Text>
                      <View
                        style={[
                          styles.statusPill,
                          { backgroundColor: statusColors.background },
                        ]}
                      >
                        <Text
                          style={[
                            styles.statusPillText,
                            { color: statusColors.foreground },
                          ]}
                        >
                          {alert?.status ?? "Bientôt"}
                        </Text>
                      </View>
                    </View>

                    <Text style={styles.activeBatchMeta}>
                      {alert?.currentStepLabel ?? "Étape en cours"} →{" "}
                      {alert?.nextStepLabel ?? "Étape suivante"}
                    </Text>

                    <View style={styles.timelineRow}>
                      {timeline.map((step) => {
                        const dotStyle =
                          step.state === "past"
                            ? styles.timelineDotPast
                            : step.state === "current"
                              ? styles.timelineDotCurrent
                              : styles.timelineDotNext;

                        return (
                          <View
                            key={`${batch.id}-${step.label}`}
                            style={styles.timelineItem}
                          >
                            <View style={[styles.timelineDot, dotStyle]} />
                            <Text
                              style={styles.timelineLabel}
                              numberOfLines={1}
                            >
                              {step.label}
                            </Text>
                          </View>
                        );
                      })}
                    </View>
                  </Pressable>
                );
              })}
            </View>
          )}
        </Card>

        <Card style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Navigation rapide</Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Voir plus de sections"
              onPress={() => setIsMoreSheetVisible(true)}
              style={({ pressed }) => [
                styles.linkButton,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.linkButtonText}>Voir plus</Text>
            </Pressable>
          </View>

          <View style={styles.navigationGrid}>
            {topNavigationCards.map((card) => {
              const statusColors = getStatusColors(card.status);

              return (
                <Pressable
                  key={card.id}
                  accessibilityRole="button"
                  accessibilityLabel={`Ouvrir ${card.label}`}
                  onPress={() => router.push(card.href)}
                  style={({ pressed }) => [
                    styles.navigationCard,
                    pressed && styles.pressed,
                  ]}
                >
                  <View style={styles.navigationTopRow}>
                    <Ionicons name={card.icon} size={20} color={card.color} />
                    <Text style={styles.navigationTitle}>{card.label}</Text>
                  </View>

                  <Text style={styles.navigationMetric}>{card.metric}</Text>

                  <View
                    style={[
                      styles.statusPill,
                      { backgroundColor: statusColors.background },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusPillText,
                        { color: statusColors.foreground },
                      ]}
                    >
                      {card.status}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
        </Card>
      </ScrollView>

      <Modal
        transparent
        animationType="slide"
        visible={isMoreSheetVisible}
        onRequestClose={() => setIsMoreSheetVisible(false)}
      >
        <View style={styles.modalRoot}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Fermer Voir plus"
            accessibilityHint="Touchez l’arrière-plan pour fermer la feuille Voir plus."
            onPress={() => setIsMoreSheetVisible(false)}
            style={styles.modalOverlay}
          />
          <View style={styles.bottomSheet}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>Voir plus</Text>

            {MORE_SECTION_CONFIGS.map((section) => (
              <View key={section.title}>
                <Text style={styles.sheetSectionTitle}>{section.title}</Text>
                {section.items.map((item) =>
                  renderMoreSectionItem(item, handleMoreItemPress),
                )}
              </View>
            ))}
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: spacing.xl,
    gap: spacing.sm,
  },
  headerCard: {
    backgroundColor: colors.neutral.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    padding: spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerIdentity: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: colors.brand.primary + "30",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: typography.size.body,
    fontWeight: typography.weight.bold,
    color: colors.brand.secondary,
  },
  headerName: {
    fontSize: typography.size.body,
    fontWeight: typography.weight.bold,
    color: colors.neutral.textPrimary,
  },
  headerSubtitle: {
    fontSize: typography.size.caption,
    color: colors.neutral.textSecondary,
  },
  profileButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xxs,
    backgroundColor: colors.brand.background,
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  profileButtonText: {
    fontSize: typography.size.caption,
    color: colors.brand.secondary,
    fontWeight: typography.weight.medium,
  },
  sectionCard: {
    borderRadius: radius.lg,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: typography.size.body,
    fontWeight: typography.weight.bold,
    color: colors.neutral.textPrimary,
  },
  sectionMeta: {
    fontSize: typography.size.caption,
    color: colors.neutral.textSecondary,
  },
  periodFilters: {
    flexDirection: "row",
    gap: spacing.xs,
  },
  periodChip: {
    flex: 1,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    paddingVertical: spacing.xs,
    alignItems: "center",
  },
  periodChipSelected: {
    backgroundColor: colors.brand.secondary,
    borderColor: colors.brand.secondary,
  },
  periodChipText: {
    fontSize: typography.size.caption,
    color: colors.neutral.textSecondary,
    fontWeight: typography.weight.medium,
  },
  periodChipTextSelected: {
    color: colors.neutral.white,
  },
  kpiRow: {
    flexDirection: "row",
    gap: spacing.xs,
  },
  kpiCard: {
    flex: 1,
    borderRadius: radius.md,
    backgroundColor: colors.brand.background,
    padding: spacing.sm,
  },
  kpiTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.xs,
  },
  kpiValue: {
    fontSize: typography.size.h2,
    fontWeight: typography.weight.bold,
    color: colors.neutral.textPrimary,
  },
  kpiLabel: {
    fontSize: typography.size.caption,
    color: colors.neutral.textSecondary,
  },
  alertsList: {
    gap: spacing.sm,
  },
  alertItem: {
    borderWidth: 1,
    borderColor: colors.neutral.border,
    borderRadius: radius.md,
    padding: spacing.sm,
    gap: spacing.sm,
  },
  alertContent: {
    gap: spacing.xxs,
  },
  alertBatchName: {
    fontSize: typography.size.label,
    fontWeight: typography.weight.bold,
    color: colors.neutral.textPrimary,
  },
  alertMetaText: {
    fontSize: typography.size.caption,
    color: colors.neutral.textSecondary,
  },
  alertDueText: {
    fontSize: typography.size.caption,
    color: colors.neutral.textPrimary,
    fontWeight: typography.weight.medium,
  },
  alertActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: spacing.sm,
  },
  statusPill: {
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
  },
  statusPillText: {
    fontSize: typography.size.caption,
    fontWeight: typography.weight.medium,
  },
  openBatchButton: {
    backgroundColor: colors.brand.secondary,
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  openBatchButtonText: {
    color: colors.neutral.white,
    fontSize: typography.size.caption,
    fontWeight: typography.weight.medium,
  },
  linkButton: {
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xxs,
  },
  linkButtonText: {
    fontSize: typography.size.caption,
    color: colors.brand.secondary,
    fontWeight: typography.weight.medium,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    paddingVertical: spacing.md,
  },
  emptyStateText: {
    fontSize: typography.size.label,
    color: colors.neutral.textSecondary,
  },
  emptyStateAction: {
    marginTop: spacing.xs,
    backgroundColor: colors.brand.secondary,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  emptyStateActionText: {
    color: colors.neutral.white,
    fontSize: typography.size.caption,
    fontWeight: typography.weight.medium,
  },
  activeBatchesList: {
    gap: spacing.sm,
  },
  activeBatchItem: {
    borderWidth: 1,
    borderColor: colors.neutral.border,
    borderRadius: radius.md,
    padding: spacing.sm,
    gap: spacing.xs,
  },
  activeBatchHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  activeBatchTitle: {
    fontSize: typography.size.label,
    fontWeight: typography.weight.bold,
    color: colors.neutral.textPrimary,
  },
  activeBatchMeta: {
    fontSize: typography.size.caption,
    color: colors.neutral.textSecondary,
  },
  timelineRow: {
    flexDirection: "row",
    gap: spacing.xs,
  },
  timelineItem: {
    flex: 1,
    alignItems: "center",
    gap: spacing.xxs,
  },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: radius.full,
  },
  timelineDotPast: {
    backgroundColor: colors.semantic.success,
  },
  timelineDotCurrent: {
    backgroundColor: colors.brand.secondary,
  },
  timelineDotNext: {
    backgroundColor: colors.neutral.muted,
  },
  timelineLabel: {
    fontSize: typography.size.caption,
    color: colors.neutral.textSecondary,
  },
  navigationGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
  },
  navigationCard: {
    width: "48%",
    borderWidth: 1,
    borderColor: colors.neutral.border,
    borderRadius: radius.md,
    padding: spacing.sm,
    gap: spacing.xs,
  },
  navigationTopRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  navigationTitle: {
    fontSize: typography.size.label,
    fontWeight: typography.weight.bold,
    color: colors.neutral.textPrimary,
  },
  navigationMetric: {
    fontSize: typography.size.caption,
    color: colors.neutral.textSecondary,
  },
  modalRoot: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.neutral.black + "55",
  },
  bottomSheet: {
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    backgroundColor: colors.neutral.white,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg,
    gap: spacing.xs,
  },
  sheetHandle: {
    width: 44,
    height: spacing.xxs,
    borderRadius: radius.full,
    backgroundColor: colors.neutral.border,
    alignSelf: "center",
    marginBottom: spacing.xs,
  },
  sheetTitle: {
    fontSize: typography.size.body,
    fontWeight: typography.weight.bold,
    color: colors.neutral.textPrimary,
    marginBottom: spacing.xs,
  },
  sheetSectionTitle: {
    fontSize: typography.size.caption,
    color: colors.neutral.textSecondary,
    marginTop: spacing.xs,
  },
  sheetItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
  },
  sheetItemLabel: {
    flex: 1,
    fontSize: typography.size.label,
    color: colors.neutral.textPrimary,
  },
  pressed: {
    opacity: 0.85,
  },
});
