import React, { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useQuery } from "@tanstack/react-query";

import { PrimaryButton } from "@/core/ui/PrimaryButton";
import { colors, radius, spacing, typography } from "@/core/theme";
import { HttpError, getErrorMessage } from "@/core/http/http-error";

import {
  isValidPostalCode,
  loadWaterProfile,
  resolveCommunes,
} from "@/features/recipes/application/water-profile.use-cases";
import type { Commune } from "@/features/recipes/domain/water-profile.types";
import { LiveWaterProfilePanel } from "@/features/recipes/presentation/components/LiveWaterProfilePanel";

function isNotFound(error: unknown): boolean {
  return error instanceof HttpError && error.status === 404;
}

/**
 * Self-contained local-water lookup (ADR-0025 slice 1): postal code → resolve
 * communes via geo.api.gouv.fr → disambiguate if several → fetch the live
 * `/water` profile → render it. Location is ephemeral (nothing is persisted).
 */
export function LocalWaterByPostalCode() {
  const [postalCode, setPostalCode] = useState("");
  const [submittedPostalCode, setSubmittedPostalCode] = useState("");
  const [selectedCommune, setSelectedCommune] = useState<Commune | null>(null);

  const communesQuery = useQuery<Commune[]>({
    queryKey: ["geo-communes", submittedPostalCode],
    queryFn: ({ signal }) => resolveCommunes(submittedPostalCode, signal),
    enabled: isValidPostalCode(submittedPostalCode),
    retry: false,
  });

  const communes = communesQuery.data;
  // Derived, not an effect: one commune auto-selects; the user's explicit pick
  // wins. Recomputes cleanly whenever a new postal code changes the query key.
  const effectiveCommune =
    selectedCommune ?? (communes?.length === 1 ? communes[0] : null);

  const waterQuery = useQuery({
    queryKey: ["water", effectiveCommune?.codeInsee],
    queryFn: ({ signal }) =>
      loadWaterProfile(effectiveCommune?.codeInsee ?? "", signal),
    enabled: !!effectiveCommune,
    retry: false,
  });

  const handleResolve = () => {
    setSelectedCommune(null);
    setSubmittedPostalCode(postalCode.trim());
  };

  const showInvalidHint =
    postalCode.trim().length > 0 && !isValidPostalCode(postalCode);
  // Kept mounted while several communes match, so the user can switch after a
  // miss without re-typing (highlighting the current pick).
  const showPicker = !!communes && communes.length > 1;
  const showUnknown =
    !!communes && communes.length === 0 && !communesQuery.isFetching;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mon eau (par code postal)</Text>
      <Text style={styles.subtitle}>
        Renseigne ton code postal pour obtenir le profil de l'eau de chez toi.
      </Text>

      <View style={styles.inputRow}>
        <TextInput
          testID="water-postal-input"
          style={styles.input}
          value={postalCode}
          onChangeText={setPostalCode}
          placeholder="Ex. 59000"
          placeholderTextColor={colors.neutral.textSecondary}
          keyboardType="number-pad"
          maxLength={5}
          accessibilityLabel="Code postal"
        />
        <PrimaryButton
          testID="water-resolve-button"
          label="Trouver mon eau"
          onPress={handleResolve}
          disabled={!isValidPostalCode(postalCode)}
          accessibilityRole="button"
          accessibilityState={{ disabled: !isValidPostalCode(postalCode) }}
          style={styles.button}
        />
      </View>

      {showInvalidHint ? (
        <Text style={styles.hint}>
          Un code postal français comporte 5 chiffres.
        </Text>
      ) : null}

      {communesQuery.isFetching ? (
        <ActivityIndicator
          testID="water-communes-loading"
          color={colors.brand.primary}
        />
      ) : null}

      {communesQuery.isError ? (
        <Text testID="water-communes-error" style={styles.error}>
          {getErrorMessage(communesQuery.error)}
        </Text>
      ) : null}

      {showUnknown ? (
        <Text style={styles.hint}>Code postal inconnu, vérifie ta saisie.</Text>
      ) : null}

      {showPicker ? (
        <View style={styles.picker}>
          <Text style={styles.pickerTitle}>
            Plusieurs communes partagent ce code postal — laquelle ?
          </Text>
          {communes?.map((commune) => {
            const isSelected =
              commune.codeInsee === effectiveCommune?.codeInsee;
            return (
              <Pressable
                key={commune.codeInsee}
                testID={`water-commune-${commune.codeInsee}`}
                style={[
                  styles.pickerOption,
                  isSelected && styles.pickerOptionSelected,
                ]}
                onPress={() => setSelectedCommune(commune)}
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected }}
              >
                <Text style={styles.pickerOptionText}>{commune.nom}</Text>
              </Pressable>
            );
          })}
        </View>
      ) : null}

      {effectiveCommune && waterQuery.isLoading ? (
        <ActivityIndicator
          testID="water-profile-loading"
          color={colors.brand.primary}
        />
      ) : null}

      {effectiveCommune && waterQuery.isError ? (
        <Text testID="water-profile-error" style={styles.error}>
          {isNotFound(waterQuery.error)
            ? "Pas de données d'eau pour cette commune cette année."
            : getErrorMessage(waterQuery.error)}
        </Text>
      ) : null}

      {effectiveCommune && waterQuery.data ? (
        <LiveWaterProfilePanel profile={waterQuery.data} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.xs,
    marginTop: spacing.md,
  },
  title: {
    fontSize: typography.size.body,
    fontWeight: typography.weight.bold,
    color: colors.neutral.textPrimary,
  },
  subtitle: {
    fontSize: typography.size.caption,
    color: colors.neutral.textSecondary,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    fontSize: typography.size.body,
    color: colors.neutral.textPrimary,
    backgroundColor: colors.neutral.white,
  },
  button: {
    flexShrink: 0,
  },
  hint: {
    fontSize: typography.size.caption,
    color: colors.neutral.textSecondary,
  },
  error: {
    fontSize: typography.size.label,
    color: colors.semantic.error,
  },
  picker: {
    gap: spacing.xxs,
  },
  pickerTitle: {
    fontSize: typography.size.label,
    color: colors.neutral.textPrimary,
  },
  pickerOption: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    borderRadius: radius.md,
    backgroundColor: colors.neutral.white,
  },
  pickerOptionSelected: {
    borderColor: colors.brand.primary,
    backgroundColor: colors.state.infoBackground,
  },
  pickerOptionText: {
    fontSize: typography.size.body,
    color: colors.neutral.textPrimary,
  },
});
