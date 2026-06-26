import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { dataSource } from "@/core/data/data-source";
import { getErrorMessage } from "@/core/http/http-error";
import { colors, spacing, typography } from "@/core/theme";
import { Card } from "@/core/ui/Card";
import { HeaderBackButton } from "@/core/ui/HeaderBackButton";
import { ListHeader } from "@/core/ui/ListHeader";
import { useNavigationFooterOffset } from "@/core/ui/NavigationFooter";
import { PrimaryButton } from "@/core/ui/PrimaryButton";
import { Screen } from "@/core/ui/Screen";
import {
  closeBottling,
  getBottlingInfo,
} from "@/features/batches/application/bottling.use-cases";
import { Batch } from "@/features/batches/domain/batch.types";
import {
  PrimingInfo,
  PrimingSugarType,
  SAFETY_WARNING,
} from "@/features/batches/domain/bottling.types";

type Props = {
  /** Identifier of the batch being bottled and closed. */
  batchId: string;
};

/** Plain-French label for each priming sugar kind. */
const SUGAR_TYPE_LABELS: Record<PrimingSugarType, string> = {
  table_sugar: "sucre de table (saccharose)",
  dextrose: "dextrose (glucose)",
};

/** Beginner bottling gestures, taught step by step (maître-mot : éduquer). */
const BOTTLING_STEPS: ReadonlyArray<string> = [
  "Désinfecte les bouteilles et les capsules : c'est l'étape qui évite la contamination.",
  "Ajoute le sucre de réamorçage pesé à la balance, puis transvase la bière au siphon, doucement, sans éclabousser (pour ne pas oxyder).",
  "Remplis en laissant ~2 cm sous le goulot, capsule fermement chaque bouteille.",
  "Laisse refermenter en bouteille ~2 à 3 semaines à température ambiante, puis place au frais avant de déguster.",
];

/**
 * Bottling + closure screen (B3).
 *
 * Teaches the novice the priming dose (from `GET /priming`, volume sourced
 * from the recipe per ADR-0020) and the beginner bottling gestures, then gates
 * the irreversible closure behind:
 * - a PROMINENT bottle-bomb safety warning (rendered verbatim from the
 *   backend), and
 * - a required "j'ai compris le risque" checkbox that disables the close
 *   button until ticked.
 *
 * On confirm it fires `closeBottling`, invalidates the batch detail + list
 * query keys, and navigates to the closure / celebration view.
 *
 * @param props - The identifier of the batch being bottled.
 */
export function BottlingScreen({ batchId }: Props) {
  const bottomPadding = useNavigationFooterOffset();
  const router = useRouter();
  const queryClient = useQueryClient();
  const missingBatchId = !batchId;

  const [acknowledged, setAcknowledged] = React.useState(false);

  const {
    data: priming = null,
    isLoading: isLoadingPriming,
    error: primingError,
  } = useQuery<PrimingInfo | null>({
    queryKey: ["batches", "priming", batchId],
    queryFn: () => getBottlingInfo(batchId),
    enabled: !missingBatchId,
  });

  const {
    mutate: mutateClose,
    isPending,
    error: closeError,
  } = useMutation<Batch | null, Error, void>({
    mutationFn: () => closeBottling(batchId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["batches", "details", batchId],
      });
      void queryClient.invalidateQueries({ queryKey: ["batches", "list"] });
      router.replace({
        pathname: "/batches/[id]",
        params: { id: batchId },
      });
    },
  });

  const handleClose = () => {
    if (missingBatchId || !acknowledged) {
      return;
    }
    mutateClose();
  };

  const primingErrorMessage = primingError
    ? getErrorMessage(primingError, "Impossible de calculer le réamorçage")
    : null;

  return (
    <Screen>
      <ListHeader
        title="Mettre en bouteille"
        subtitle="Réamorçage, gestes clés et clôture du brassin"
        action={
          <HeaderBackButton
            label="Retour"
            accessibilityLabel="Retour au brassin"
            onPress={() => router.back()}
          />
        }
      />

      <ScrollView
        contentContainerStyle={{ paddingBottom: bottomPadding }}
        showsVerticalScrollIndicator={false}
      >
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Dose de sucre de réamorçage</Text>
          {isLoadingPriming ? (
            <Text style={styles.helpText}>Calcul en cours…</Text>
          ) : priming ? (
            <>
              <Text testID="priming-dose" style={styles.doseValue}>
                {priming.sugarGrams} g
              </Text>
              <Text style={styles.helpText}>
                {SUGAR_TYPE_LABELS[priming.sugarType]} pour {priming.volumeL} L,
                soit environ {priming.targetCo2Vol} volumes de CO₂. Ce sucre
                relance une petite fermentation en bouteille : c'est elle qui
                crée les bulles.
              </Text>
            </>
          ) : (
            <Text testID="priming-error" style={styles.helpText}>
              {primingErrorMessage ??
                "Réamorçage indisponible pour ce brassin."}
            </Text>
          )}
        </Card>

        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Les gestes de l'embouteillage</Text>
          {BOTTLING_STEPS.map((step, index) => (
            <View key={step} style={styles.stepRow}>
              <Text style={styles.stepIndex}>{index + 1}</Text>
              <Text style={styles.stepText}>{step}</Text>
            </View>
          ))}
        </Card>

        <Card style={[styles.card, styles.warningCard]}>
          <View style={styles.warningHeader}>
            <Ionicons name="warning" size={22} color={colors.semantic.error} />
            <Text style={styles.warningTitle}>
              Danger : bouteille qui explose
            </Text>
          </View>
          <Text testID="bottling-safety-warning" style={styles.warningText}>
            {priming?.safetyWarning ?? SAFETY_WARNING}
          </Text>
        </Card>

        <Pressable
          testID="bottling-ack-checkbox"
          accessibilityRole="checkbox"
          accessibilityState={{ checked: acknowledged }}
          accessibilityLabel="J'ai compris le risque de surpression"
          style={({ pressed }) => [
            styles.ackRow,
            pressed && styles.ackRowPressed,
          ]}
          onPress={() => setAcknowledged((prev) => !prev)}
        >
          <Ionicons
            name={acknowledged ? "checkmark-circle" : "ellipse-outline"}
            size={24}
            color={
              acknowledged ? colors.semantic.success : colors.neutral.muted
            }
          />
          <Text style={styles.ackText}>
            J'ai compris le risque et je respecte la dose de sucre indiquée.
          </Text>
        </Pressable>

        {closeError ? (
          <Card style={[styles.card, styles.errorCard]}>
            <Text style={styles.errorText}>
              {getErrorMessage(closeError, "Échec de la mise en bouteille")}
            </Text>
          </Card>
        ) : null}

        <PrimaryButton
          label={
            isPending ? "Clôture en cours…" : "Mettre en bouteille / clôturer"
          }
          onPress={handleClose}
          disabled={isPending || !acknowledged || missingBatchId}
        />
        {!acknowledged ? (
          <Text style={styles.gateHint}>
            Coche la case de sécurité pour pouvoir clôturer le brassin.
          </Text>
        ) : null}

        {dataSource.useDemoData ? (
          <Text style={styles.demoHint}>
            Mode démo : la clôture est simulée.
          </Text>
        ) : null}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.sm,
  },
  cardTitle: {
    fontSize: typography.size.h2,
    lineHeight: typography.lineHeight.h2,
    fontWeight: typography.weight.bold,
    color: colors.neutral.textPrimary,
    marginBottom: spacing.xs,
  },
  helpText: {
    fontSize: typography.size.label,
    lineHeight: typography.lineHeight.label,
    color: colors.neutral.textSecondary,
  },
  doseValue: {
    fontSize: typography.size.h1,
    lineHeight: typography.lineHeight.h1,
    fontWeight: typography.weight.bold,
    color: colors.brand.primary,
    marginBottom: spacing.xs,
  },
  stepRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  stepIndex: {
    width: spacing.lg,
    textAlign: "center",
    fontWeight: typography.weight.bold,
    color: colors.brand.secondary,
    fontSize: typography.size.label,
    lineHeight: typography.lineHeight.label,
  },
  stepText: {
    flex: 1,
    fontSize: typography.size.label,
    lineHeight: typography.lineHeight.label,
    color: colors.neutral.textPrimary,
  },
  warningCard: {
    backgroundColor: colors.state.errorBackground,
    borderColor: colors.semantic.error,
  },
  warningHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  warningTitle: {
    flex: 1,
    fontSize: typography.size.body,
    lineHeight: typography.lineHeight.body,
    fontWeight: typography.weight.bold,
    color: colors.semantic.error,
  },
  warningText: {
    fontSize: typography.size.label,
    lineHeight: typography.lineHeight.label,
    color: colors.semantic.error,
  },
  ackRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    marginBottom: spacing.sm,
  },
  ackRowPressed: {
    opacity: 0.7,
  },
  ackText: {
    flex: 1,
    fontSize: typography.size.label,
    lineHeight: typography.lineHeight.label,
    fontWeight: typography.weight.medium,
    color: colors.neutral.textPrimary,
  },
  errorCard: {
    backgroundColor: colors.state.errorBackground,
    borderColor: colors.semantic.error,
  },
  errorText: {
    fontSize: typography.size.label,
    lineHeight: typography.lineHeight.label,
    color: colors.semantic.error,
  },
  gateHint: {
    marginTop: spacing.xs,
    textAlign: "center",
    fontSize: typography.size.caption,
    lineHeight: typography.lineHeight.caption,
    color: colors.neutral.textSecondary,
  },
  demoHint: {
    marginTop: spacing.sm,
    textAlign: "center",
    fontSize: typography.size.caption,
    lineHeight: typography.lineHeight.caption,
    color: colors.neutral.muted,
  },
});
