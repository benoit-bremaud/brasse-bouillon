import React, { useMemo, useRef, useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";

import { useRouter } from "expo-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { colors, spacing, typography } from "@/core/theme";
import { getErrorMessage } from "@/core/http/http-error";
import { useConfirm } from "@/core/ui/confirm-provider";
import { Badge } from "@/core/ui/Badge";
import { Card } from "@/core/ui/Card";
import { ChecklistRow } from "@/core/ui/ChecklistRow";
import { CapacityFitPanel } from "@/features/recipes/presentation/components/CapacityFitPanel";
import { EmptyStateCard } from "@/core/ui/EmptyStateCard";
import { HeaderBackButton } from "@/core/ui/HeaderBackButton";
import { ListHeader } from "@/core/ui/ListHeader";
import { ScreenScrollView } from "@/core/ui/ScreenScrollView";
import { STICKY_CTA_BAR_HEIGHT } from "@/core/ui/sticky-cta-clearance";
import { useNavBarClearance } from "@/core/ui/use-nav-bar-clearance";
import { Screen } from "@/core/ui/Screen";
import {
  getRecipeDetailsViewModel,
  type RecipeDetailsViewModel,
} from "@/features/recipes/application/recipes.use-cases";
import {
  buildIngredientChecklist,
  getMissingItems,
  isChecklistComplete,
} from "@/features/recipes/application/brew-readiness.use-cases";
import type { ReadinessChecklist } from "@/features/recipes/domain/brew-readiness.types";
import { RecipeStickyCta } from "@/features/recipes/presentation/components/RecipeStickyCta";
import {
  launchBatch,
  prepareBatch,
  updateBatchPrepChecklist,
} from "@/features/batches/application/batches.use-cases";
import type { Batch } from "@/features/batches/domain/batch.types";

type Props = Readonly<{ recipeId: string }>;

/**
 * Brew preparation ("mise en place") screen — the post-recipe, pre-batch phase
 * reached from the recipe's "Préparer mon brassin" CTA. Realises the launch
 * gate (UC6 of the brew-prep conception, #1248): the irreversible batch start
 * is enabled only once the readiness checklist is complete.
 *
 * This slice gates on the INGREDIENT checklist only; the equipment checklist
 * (A3) will be added to this same screen and extend the gate to
 * `ingredient.isComplete() && equipment.isComplete()` (BrewReadiness).
 *
 * The prep is carried by an « en préparation » draft batch (brew-day/07,
 * F14/F15): opening the screen prepares (or resumes) the recipe's draft, each
 * tick is persisted on it, and « Lancer le brassage » is the draft →
 * in_progress transition. The checklist items stay derived from the recipe —
 * only the coches live on the batch, so they reset naturally on each new brew
 * (F14) while surviving app restarts mid-prep.
 */
export function BrewPrepScreen({ recipeId }: Props) {
  const router = useRouter();
  const confirm = useConfirm();
  const queryClient = useQueryClient();
  const navBarClearance = useNavBarClearance();
  const hasRecipeId = recipeId.trim().length > 0;

  const {
    data: viewModel = null,
    isLoading,
    isFetched,
    error: queryError,
    refetch,
  } = useQuery<RecipeDetailsViewModel | null>({
    queryKey: ["recipes", "detail", recipeId],
    queryFn: () => getRecipeDetailsViewModel(recipeId),
    enabled: hasRecipeId,
  });

  // The draft batch carrying this prep. A POST used as a query is deliberate:
  // prepareBatch is idempotent server-side (it resumes the existing draft), so
  // re-mounting the screen re-opens the same prep with its persisted coches.
  const {
    data: draft = null,
    isLoading: isDraftLoading,
    error: draftError,
    refetch: refetchDraft,
  } = useQuery<Batch | null>({
    queryKey: ["batches", "prep", recipeId],
    queryFn: () => prepareBatch(recipeId),
    enabled: hasRecipeId,
  });

  const launchMutation = useMutation({
    mutationFn: (draftId: string) => launchBatch(draftId),
    onSuccess: (batch) => {
      void queryClient.invalidateQueries({ queryKey: ["batches"] });
      router.push(`/(app)/batches/${batch.id}`);
    },
  });

  // Persists the full checked-ids list on the draft. The payload being a full
  // replacement, PATCHes must never overlap: two in-flight requests can reach
  // the server out of order and the OLDER list would win (lost tick). So one
  // request flies at a time; while it runs only the LATEST desired list is
  // kept queued (intermediate lists are obsolete by construction).
  const persistMutation = useMutation({
    mutationFn: (input: { draftId: string; checkedIds: string[] }) =>
      updateBatchPrepChecklist(input.draftId, input.checkedIds),
  });
  const patchInFlightRef = useRef(false);
  const queuedCheckedIdsRef = useRef<string[] | null>(null);

  const sendCheckedIds = (draftId: string, checkedIds: string[]) => {
    patchInFlightRef.current = true;
    persistMutation.mutate(
      { draftId, checkedIds },
      {
        onError: (error) => {
          // The failed PATCH may carry several coalesced ticks, so per-tick
          // rollback is meaningless: drop the optimistic overlay, re-sync the
          // draft from the server, and tell the brewer — a silently lost
          // coche would resurface as a phantom missing ingredient later.
          queuedCheckedIdsRef.current = null;
          setHaveById({});
          void refetchDraft();
          Alert.alert(
            "Coche non enregistrée",
            getErrorMessage(error, "Réessaie dans un instant."),
          );
        },
        onSettled: () => {
          patchInFlightRef.current = false;
          const queued = queuedCheckedIdsRef.current;
          queuedCheckedIdsRef.current = null;
          if (queued) {
            sendCheckedIds(draftId, queued);
          }
        },
      },
    );
  };

  // Base checklist derived from the recipe; never mutated by ticks (a refetch
  // re-derives it, but the user's `have` overlay below is kept separately so
  // a background refetch can't wipe the ticks).
  const checklist = useMemo(
    () => buildIngredientChecklist(viewModel?.ingredients ?? []),
    [viewModel],
  );

  // Coches persisted on the draft (source of truth) + the session's optimistic
  // overrides (snappy toggles while the PATCH is in flight).
  const persistedChecked = useMemo(
    () => new Set(draft?.prepCheckedIds ?? []),
    [draft],
  );
  const [haveById, setHaveById] = useState<Record<string, boolean>>({});

  const mergedChecklist = useMemo<ReadinessChecklist>(
    () => ({
      ...checklist,
      items: checklist.items.map((item) => ({
        ...item,
        have: haveById[item.id] ?? persistedChecked.has(item.id),
      })),
    }),
    [checklist, haveById, persistedChecked],
  );

  const missing = getMissingItems(mergedChecklist);
  const complete = isChecklistComplete(mergedChecklist);
  const hasItems = mergedChecklist.items.length > 0;

  const toggle = (id: string) => {
    const next = !(haveById[id] ?? persistedChecked.has(id));
    setHaveById((current) => ({ ...current, [id]: next }));

    if (!draft) {
      return;
    }
    const checkedIds = mergedChecklist.items
      .map((item) => (item.id === id ? { ...item, have: next } : item))
      .filter((item) => item.have)
      .map((item) => item.id);
    if (patchInFlightRef.current) {
      queuedCheckedIdsRef.current = checkedIds;
      return;
    }
    sendCheckedIds(draft.id, checkedIds);
  };

  const isStarting = launchMutation.isPending;
  // Launching while a checklist PATCH is in flight (or queued) would race
  // the backend: launch stamps launched_at, then the late PATCH is rejected
  // ("already launched") — last tick lost + error alert after navigation.
  // The queue only fills while a send is in flight and is flushed on settle,
  // so isPending alone covers both.
  const isSavingChecklist = persistMutation.isPending;

  // The launch is irreversible (phase B = point of no return), so it is
  // gated twice: the CTA is disabled until the checklist is complete AND
  // persisted, and a final confirmation dialog guards the batch creation.
  const handleLaunch = async () => {
    if (!complete || isStarting || isSavingChecklist || !draft) {
      return;
    }
    const confirmed = await confirm({
      title: "Lancer le brassage ?",
      message:
        "Cette action démarre le suivi du brassin et n'est pas réversible.",
      confirmLabel: "Lancer",
    });
    if (confirmed) {
      launchMutation.mutate(draft.id);
    }
  };

  const handleRetry = () => {
    if (launchMutation.error) {
      launchMutation.reset();
    }
    void refetch();
    void refetchDraft();
  };

  const errorMessage = queryError
    ? getErrorMessage(queryError, "Impossible de charger la recette")
    : draftError
      ? getErrorMessage(draftError, "Impossible de préparer le brassin")
      : launchMutation.error
        ? getErrorMessage(
            launchMutation.error,
            "Le démarrage du brassin a échoué",
          )
        : null;

  // A missing id, or a fetch that resolved to no recipe (stale / deleted id),
  // is a not-found state — not an empty checklist (see PR #1255 for context).
  if (!hasRecipeId || (isFetched && !isLoading && !viewModel && !queryError)) {
    return (
      <Screen>
        <HeaderBackButton
          label="Recette"
          accessibilityLabel="Revenir à la recette"
          onPress={() => router.back()}
        />
        <EmptyStateCard
          title="Recette introuvable"
          description="Cette recette n'a pas pu être chargée."
        />
      </Screen>
    );
  }

  const ctaLabel = isStarting ? "Démarrage..." : "Lancer le brassage";
  const ctaHelper = complete
    ? hasItems
      ? "Tout est prêt."
      : "Aucun ingrédient à vérifier."
    : "Coche tous les ingrédients pour lancer le brassage.";

  return (
    <Screen
      isLoading={isLoading || isDraftLoading}
      error={errorMessage}
      onRetry={handleRetry}
    >
      <HeaderBackButton
        label="Recette"
        accessibilityLabel="Revenir à la recette"
        onPress={() => router.back()}
      />

      <View style={styles.body}>
        <ScreenScrollView
          // The sticky CTA is always mounted on this screen, so its content
          // must clear both bars — same contract as recipe/batch details.
          extraBottomClearance={STICKY_CTA_BAR_HEIGHT}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <ListHeader
            title="Préparer mon brassin"
            subtitle="Mise en place : coche ce que tu as. Le brassage se lance une fois la liste complète."
          />

          {/* Capacity fit-check first (ADR-0026): advisory, never blocks the launch. */}
          <CapacityFitPanel recipeId={recipeId} />

          {hasItems ? (
            <Card style={styles.listCard}>
              {mergedChecklist.items.map((item) => (
                <ChecklistRow
                  key={item.id}
                  testID={`ingredient-readiness-row-${item.id}`}
                  label={item.name}
                  meta={item.qty}
                  checked={item.have}
                  onToggle={() => toggle(item.id)}
                />
              ))}
            </Card>
          ) : (
            <EmptyStateCard
              title="Aucun ingrédient listé"
              description="Cette recette ne déclare pas encore d'ingrédients à vérifier."
            />
          )}

          {hasItems ? (
            <Card style={styles.recapCard}>
              <View style={styles.recapHeader}>
                <Text style={styles.recapTitle}>Ce qu'il te manque</Text>
                {complete ? <Badge variant="success" label="Prêt" /> : null}
              </View>
              {complete ? (
                <Text style={styles.recapBody}>
                  Tu as tous les ingrédients de la recette.
                </Text>
              ) : (
                <>
                  <Text style={styles.recapBody}>
                    {missing.length} ingrédient{missing.length > 1 ? "s" : ""} à
                    prévoir :
                  </Text>
                  {missing.map((item) => (
                    <Text
                      key={item.id}
                      testID={`ingredient-readiness-missing-${item.id}`}
                      style={styles.recapItem}
                    >
                      • {item.name} ({item.qty})
                    </Text>
                  ))}
                </>
              )}
            </Card>
          ) : null}
        </ScreenScrollView>
      </View>

      <RecipeStickyCta
        label={ctaLabel}
        helperText={ctaHelper}
        onPress={() => void handleLaunch()}
        disabled={
          !complete || isStarting || isSavingChecklist || !viewModel || !draft
        }
        bottomOffset={navBarClearance}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
  },
  content: {
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    gap: spacing.md,
  },
  listCard: {
    padding: spacing.md,
  },
  recapCard: {
    padding: spacing.md,
  },
  recapHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
  },
  recapTitle: {
    fontSize: typography.size.body,
    lineHeight: typography.lineHeight.body,
    fontWeight: typography.weight.bold,
    color: colors.neutral.textPrimary,
  },
  recapBody: {
    color: colors.neutral.textSecondary,
    fontSize: typography.size.label,
    lineHeight: typography.lineHeight.label,
  },
  recapItem: {
    marginTop: spacing.xxs,
    color: colors.neutral.textPrimary,
    fontSize: typography.size.label,
    lineHeight: typography.lineHeight.label,
  },
});
