import React from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";

import { colors, spacing, typography } from "@/core/theme";
import { getErrorMessage } from "@/core/http/http-error";
import { Badge } from "@/core/ui/Badge";
import { Card } from "@/core/ui/Card";
import { HeaderBackButton } from "@/core/ui/HeaderBackButton";
import { ListHeader } from "@/core/ui/ListHeader";
import { PrimaryButton } from "@/core/ui/PrimaryButton";
import { Screen } from "@/core/ui/Screen";

import {
  deleteEquipmentProfile,
  getEquipmentProfile,
} from "@/features/equipment/application/equipment.use-cases";
import { EQUIPMENT_SYSTEM_OPTIONS } from "@/features/equipment/domain/equipment-system-options";
import { EquipmentSystemType } from "@/features/equipment/domain/equipment.types";

type Props = {
  profileId: string;
};

function systemTypeLabel(systemType: EquipmentSystemType): string {
  return (
    EQUIPMENT_SYSTEM_OPTIONS.find((option) => option.value === systemType)
      ?.label ?? systemType
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

export function EquipmentDetailScreen({ profileId }: Props) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const {
    data: profile,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["equipment", "detail", profileId],
    queryFn: () => getEquipmentProfile(profileId),
    enabled: profileId.length > 0,
  });

  const { mutate: removeProfile, isPending: isDeleting } = useMutation({
    mutationFn: () => deleteEquipmentProfile(profileId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["equipment", "list"] });
      router.replace("/equipment");
    },
    onError: () => {
      Alert.alert(
        "Suppression impossible",
        "Le matériel n'a pas pu être supprimé. Vérifie ta connexion et réessaie.",
      );
    },
  });

  const goBack = () => router.replace("/equipment");

  const confirmDelete = () => {
    Alert.alert(
      "Supprimer ce matériel ?",
      "Il sera retiré de ton office. Cette action est irréversible.",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: () => removeProfile(),
        },
      ],
    );
  };

  const header = (
    <ListHeader
      title="Mon matériel"
      subtitle="Détail de l'équipement"
      action={
        <HeaderBackButton
          label="L'Office"
          accessibilityLabel="Retour à l'office"
          onPress={goBack}
        />
      }
    />
  );

  if (isLoading) {
    return <Screen isLoading>{null}</Screen>;
  }

  if (isError || !profile) {
    return (
      <Screen>
        {header}
        <Card style={[styles.card, styles.blockCard]}>
          <Text style={styles.blockText}>
            {getErrorMessage(error, "Matériel introuvable")}
          </Text>
        </Card>
      </Screen>
    );
  }

  return (
    <Screen>
      {header}

      <Card style={styles.card}>
        <View style={styles.topRow}>
          <Text style={styles.title}>{profile.name}</Text>
          <Badge label={systemTypeLabel(profile.systemType)} variant="info" />
        </View>

        <View style={styles.rows}>
          <DetailRow
            label="Fermenteur"
            value={`${profile.fermenterVolumeL} L`}
          />
          <DetailRow
            label="Plus grande marmite"
            value={`${profile.boilKettleVolumeL} L`}
          />
          <DetailRow
            label="Efficacité estimée"
            value={`${profile.efficiencyEstimatedPercent} %`}
          />
          <DetailRow
            label="Évaporation"
            value={`${profile.evaporationRateLPerHour} L/h`}
          />
        </View>
      </Card>

      <PrimaryButton
        testID="equipment-delete-cta"
        label="Supprimer ce matériel"
        onPress={confirmDelete}
        disabled={isDeleting}
        style={styles.deleteCta}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: spacing.sm,
    padding: spacing.md,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: spacing.xs,
  },
  title: {
    flex: 1,
    fontSize: typography.size.h2,
    lineHeight: typography.lineHeight.h2,
    fontWeight: typography.weight.bold,
    color: colors.neutral.textPrimary,
  },
  rows: {
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  rowLabel: {
    color: colors.neutral.textSecondary,
    fontSize: typography.size.label,
    lineHeight: typography.lineHeight.label,
  },
  rowValue: {
    color: colors.neutral.textPrimary,
    fontWeight: typography.weight.medium,
    fontSize: typography.size.body,
    lineHeight: typography.lineHeight.body,
  },
  deleteCta: {
    marginHorizontal: spacing.sm,
    marginTop: spacing.lg,
    backgroundColor: colors.semantic.error,
  },
  blockCard: {
    backgroundColor: colors.state.errorBackground,
    borderColor: colors.semantic.error,
  },
  blockText: {
    fontSize: typography.size.label,
    lineHeight: typography.lineHeight.label,
    color: colors.semantic.error,
  },
});
