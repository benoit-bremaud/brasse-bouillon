import { FlatList, StyleSheet, Text, View } from "react-native";

import { colors, radius, spacing, typography } from "@/core/theme";
import { getErrorMessage } from "@/core/http/http-error";
import { Badge } from "@/core/ui/Badge";
import { Card } from "@/core/ui/Card";
import { EmptyStateCard } from "@/core/ui/EmptyStateCard";
import { Ionicons } from "@expo/vector-icons";
import { ListHeader } from "@/core/ui/ListHeader";
import { PrimaryButton } from "@/core/ui/PrimaryButton";
import { Screen } from "@/core/ui/Screen";
import { useNavigationFooterOffset } from "@/core/ui/NavigationFooter";
import { listEquipmentProfiles } from "@/features/equipment/application/equipment.use-cases";
import { EQUIPMENT_SYSTEM_OPTIONS } from "@/features/equipment/domain/equipment-system-options";
import {
  EquipmentProfile,
  EquipmentSystemType,
} from "@/features/equipment/domain/equipment.types";
import { useQuery } from "@tanstack/react-query";
import { Href, useRouter } from "expo-router";
import React from "react";

/**
 * The wizard route is new, so Expo Router's generated typed-routes union may not
 * include it yet; cast to {@link Href} (same approach as the labels feature).
 */
const EQUIPMENT_WIZARD_ROUTE = "/equipment/wizard" as Href;

function systemTypeLabel(systemType: EquipmentSystemType): string {
  return (
    EQUIPMENT_SYSTEM_OPTIONS.find((option) => option.value === systemType)
      ?.shortLabel ?? systemType
  );
}

export function EquipmentScreen() {
  const router = useRouter();
  const bottomPadding = useNavigationFooterOffset();

  const {
    data: profiles,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["equipment", "list"],
    queryFn: listEquipmentProfiles,
  });

  const goToWizard = () => router.push(EQUIPMENT_WIZARD_ROUTE);

  if (isLoading) {
    return <Screen isLoading>{null}</Screen>;
  }

  const hasProfiles = profiles != null && profiles.length > 0;

  return (
    <Screen>
      <ListHeader title="L'Office 🍽️" subtitle="Ton matériel brassicole" />

      {isError ? (
        <Card style={[styles.card, styles.blockCard]}>
          <Text style={styles.blockText}>
            {getErrorMessage(error, "Échec du chargement du matériel")}
          </Text>
        </Card>
      ) : hasProfiles ? (
        <>
          <PrimaryButton
            testID="equipment-add-cta"
            label="+ Ajouter mon matériel"
            onPress={goToWizard}
            style={styles.cta}
          />
          <FlatList
            data={profiles}
            keyExtractor={(item) => item.id}
            contentContainerStyle={[
              styles.list,
              { paddingBottom: bottomPadding },
            ]}
            renderItem={({ item }) => <EquipmentCard profile={item} />}
          />
        </>
      ) : (
        <EmptyStateCard
          title="Aucun matériel enregistré"
          description="Ajoute ton matériel pour adapter tes brassins à ta cuve."
          action={
            <PrimaryButton
              testID="equipment-empty-cta"
              label="Ajouter mon matériel"
              onPress={goToWizard}
            />
          }
        />
      )}
    </Screen>
  );
}

type EquipmentCardProps = {
  profile: EquipmentProfile;
};

function EquipmentCard({ profile }: EquipmentCardProps) {
  return (
    <Card style={styles.card}>
      <View style={styles.cardContent}>
        <View style={styles.itemIcon}>
          <Ionicons
            name="construct-outline"
            size={24}
            color={colors.brand.secondary}
          />
        </View>
        <View style={styles.cardInfo}>
          <View style={styles.cardTopRow}>
            <Text style={styles.cardTitle}>{profile.name}</Text>
            <Badge label={systemTypeLabel(profile.systemType)} variant="info" />
          </View>
          <Text style={styles.meta}>
            Fermenteur {profile.fermenterVolumeL} L •{" "}
            {profile.efficiencyEstimatedPercent}% eff.
          </Text>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  cta: {
    marginHorizontal: spacing.sm,
    marginBottom: spacing.sm,
  },
  list: {
    paddingHorizontal: spacing.sm,
  },
  card: {
    marginBottom: spacing.sm,
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  itemIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.lg,
    backgroundColor: colors.brand.background,
    justifyContent: "center",
    alignItems: "center",
  },
  cardInfo: {
    flex: 1,
  },
  cardTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardTitle: {
    fontSize: typography.size.body,
    lineHeight: typography.lineHeight.body,
    fontWeight: typography.weight.bold,
    color: colors.neutral.textPrimary,
    flex: 1,
    marginRight: spacing.xs,
  },
  meta: {
    marginTop: spacing.xxs,
    color: colors.neutral.textSecondary,
    fontSize: typography.size.label,
    lineHeight: typography.lineHeight.label,
  },
  blockCard: {
    marginHorizontal: spacing.sm,
    backgroundColor: colors.state.errorBackground,
    borderColor: colors.semantic.error,
  },
  blockText: {
    fontSize: typography.size.label,
    lineHeight: typography.lineHeight.label,
    color: colors.semantic.error,
  },
});
