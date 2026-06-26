import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { getErrorMessage } from "@/core/http/http-error";
import { colors, radius, spacing, typography } from "@/core/theme";
import { Card } from "@/core/ui/Card";
import { HeaderBackButton } from "@/core/ui/HeaderBackButton";
import { ListHeader } from "@/core/ui/ListHeader";
import { PrimaryButton } from "@/core/ui/PrimaryButton";
import { Screen } from "@/core/ui/Screen";
import { recordTasting } from "@/features/batches/application/bottling.use-cases";
import { Tasting } from "@/features/batches/domain/bottling.types";

type Props = {
  /** Identifier of the batch the tasting is recorded against. */
  batchId: string;
};

/** Maximum note length, mirroring the backend `CreateTastingDto` constraint. */
const NOTE_MAX_LENGTH = 2000;

/** The five selectable star values. */
const STAR_VALUES: ReadonlyArray<number> = [1, 2, 3, 4, 5];

/**
 * Tasting note screen (B3).
 *
 * Captures a 1-to-5 star rating (custom Pressable row with Ionicons
 * star/star-outline) plus an optional free-text note, records it via
 * `recordTasting`, invalidates the tasting query key, then returns to the
 * closure view. One tasting per batch in v1: a 409 from the backend surfaces
 * as an inline error.
 *
 * @param props - The identifier of the batch being rated.
 */
export function TastingScreen({ batchId }: Props) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const missingBatchId = !batchId;

  const [rating, setRating] = React.useState(0);
  const [note, setNote] = React.useState("");

  const {
    mutate: mutateRecord,
    isPending,
    error: mutationError,
  } = useMutation<Tasting | null, Error, { rating: number; note?: string }>({
    mutationFn: (input: { rating: number; note?: string }) =>
      recordTasting(batchId, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["batches", "tasting", batchId],
      });
      void queryClient.invalidateQueries({
        queryKey: ["batches", "details", batchId],
      });
      router.back();
    },
  });

  const handleSubmit = () => {
    if (missingBatchId || rating < 1) {
      return;
    }
    const trimmed = note.trim();
    mutateRecord({
      rating,
      ...(trimmed ? { note: trimmed } : {}),
    });
  };

  return (
    <Screen>
      <ListHeader
        title="Noter ma dégustation"
        subtitle="Une note et un commentaire pour te souvenir de ce brassin"
        action={
          <HeaderBackButton
            label="Retour"
            accessibilityLabel="Retour au brassin"
            onPress={() => router.back()}
          />
        }
      />

      <Card style={styles.card}>
        <Text style={styles.cardTitle}>Ta note</Text>
        <Text style={styles.helpText}>
          De 1 (à oublier) à 5 (à refaire) : il n'y a pas de mauvaise réponse,
          c'est ton ressenti qui compte.
        </Text>
        <View style={styles.starRow}>
          {STAR_VALUES.map((value) => {
            const filled = value <= rating;
            return (
              <Pressable
                key={value}
                testID={`tasting-star-${value}`}
                accessibilityRole="button"
                accessibilityLabel={`Noter ${value} sur 5`}
                accessibilityState={{ selected: filled }}
                style={styles.star}
                onPress={() => setRating(value)}
              >
                <Ionicons
                  name={filled ? "star" : "star-outline"}
                  size={36}
                  color={
                    filled ? colors.semantic.warning : colors.neutral.muted
                  }
                />
              </Pressable>
            );
          })}
        </View>
      </Card>

      <Card style={styles.card}>
        <Text style={styles.inputLabel}>Commentaire (facultatif)</Text>
        <TextInput
          testID="tasting-note-input"
          style={styles.noteInput}
          value={note}
          onChangeText={setNote}
          placeholder="Mousse, amertume, ce que tu changerais la prochaine fois…"
          multiline
          maxLength={NOTE_MAX_LENGTH}
        />
      </Card>

      {mutationError ? (
        <Card style={[styles.card, styles.errorCard]}>
          <Text style={styles.errorText}>
            {getErrorMessage(
              mutationError,
              "Échec de l'enregistrement de la dégustation",
            )}
          </Text>
        </Card>
      ) : null}

      <PrimaryButton
        label={isPending ? "Enregistrement…" : "Enregistrer ma dégustation"}
        onPress={handleSubmit}
        disabled={isPending || rating < 1 || missingBatchId}
      />
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
    marginBottom: spacing.sm,
  },
  starRow: {
    flexDirection: "row",
    gap: spacing.xs,
  },
  star: {
    padding: spacing.xxs,
  },
  inputLabel: {
    fontSize: typography.size.label,
    lineHeight: typography.lineHeight.label,
    fontWeight: typography.weight.medium,
    color: colors.neutral.textPrimary,
    marginBottom: spacing.xs,
  },
  noteInput: {
    borderWidth: 1,
    borderColor: colors.neutral.border,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    minHeight: spacing.xxl * 2,
    textAlignVertical: "top",
    fontSize: typography.size.body,
    lineHeight: typography.lineHeight.body,
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
});
