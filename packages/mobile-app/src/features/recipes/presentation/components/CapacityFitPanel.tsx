import React, { useCallback } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import type { Href } from "expo-router";
import { useQuery } from "@tanstack/react-query";

import { Badge } from "@/core/ui/Badge";
import { Card } from "@/core/ui/Card";
import { PrimaryButton } from "@/core/ui/PrimaryButton";
import { colors, spacing, typography } from "@/core/theme";
import { getErrorMessage } from "@/core/http/http-error";

import {
  describeFit,
  loadEquipmentFit,
  type LegDisplay,
} from "@/features/recipes/application/equipment-fit.use-cases";

type Props = Readonly<{ recipeId: string }>;

const EQUIPMENT_ROUTE = "/equipment" as Href;

function Leg({ leg, testID }: { leg: LegDisplay; testID: string }) {
  return (
    <View style={styles.leg} testID={testID}>
      <View style={styles.legHeader}>
        <Text style={styles.legTitle}>{leg.title}</Text>
        <Badge
          variant={leg.badgeTone}
          label={leg.badgeLabel}
          accessibilityLabel={`${leg.title} : ${leg.badgeLabel}`}
        />
      </View>
      <Text style={styles.legMessage}>{leg.message}</Text>
      {leg.detail ? <Text style={styles.legDetail}>{leg.detail}</Text> : null}
    </View>
  );
}

/**
 * Advisory equipment capacity fit-check panel (ADR-0026) — placed first on the
 * brew-prep screen. Fetches the fit for the recipe against the caller's
 * equipment and renders a per-leg advisory; it never blocks the launch. When no
 * equipment is declared, it shows a just-in-time "declare your equipment" CTA.
 */
export function CapacityFitPanel({ recipeId }: Props) {
  const router = useRouter();
  const {
    data: fit,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["equipment-fit", recipeId],
    queryFn: ({ signal }) => loadEquipmentFit(recipeId, undefined, signal),
    enabled: recipeId.trim().length > 0,
    retry: false,
  });

  // Re-check on focus so a fit computed while "no equipment" is refreshed after
  // the user declares their equipment via the CTA and returns (ADR-0026).
  useFocusEffect(
    useCallback(() => {
      void refetch();
    }, [refetch]),
  );

  return (
    <Card testID="capacity-fit-panel" style={styles.card}>
      <Text style={styles.title}>Mon matériel est-il adapté ?</Text>

      {isLoading ? (
        <ActivityIndicator
          testID="capacity-fit-loading"
          color={colors.brand.primary}
        />
      ) : null}

      {isError ? (
        <Text testID="capacity-fit-error" style={styles.error}>
          {getErrorMessage(error, "Vérification du matériel indisponible.")}
        </Text>
      ) : null}

      {fit ? renderBody() : null}
    </Card>
  );

  function renderBody() {
    if (!fit) {
      return null;
    }
    const view = describeFit(fit);
    if (view.showProfileCta) {
      return (
        <View style={styles.ctaBlock}>
          <Text style={styles.legMessage}>
            Déclare ton matériel pour vérifier que ta cuve et ta marmite suivent
            cette recette.
          </Text>
          <PrimaryButton
            testID="capacity-fit-cta"
            label="Déclarer mon matériel"
            onPress={() => router.push(EQUIPMENT_ROUTE)}
            accessibilityRole="button"
          />
        </View>
      );
    }
    return (
      <>
        <Leg leg={view.fermenter} testID="capacity-fit-fermenter" />
        <Leg leg={view.kettle} testID="capacity-fit-kettle" />
      </>
    );
  }
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.sm,
  },
  title: {
    fontSize: typography.size.body,
    fontWeight: typography.weight.bold,
    color: colors.neutral.textPrimary,
  },
  ctaBlock: {
    gap: spacing.sm,
  },
  leg: {
    gap: spacing.xxs,
  },
  legHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  legTitle: {
    fontSize: typography.size.label,
    fontWeight: typography.weight.bold,
    color: colors.neutral.textPrimary,
  },
  legMessage: {
    fontSize: typography.size.caption,
    color: colors.neutral.textSecondary,
  },
  legDetail: {
    fontSize: typography.size.caption,
    color: colors.neutral.textSecondary,
    fontWeight: typography.weight.bold,
  },
  error: {
    fontSize: typography.size.label,
    color: colors.semantic.error,
  },
});
