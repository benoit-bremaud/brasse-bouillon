import { FlatList, StyleSheet, Text, View } from "react-native";
import { colors, radius, spacing, typography } from "@/core/theme";

import { Badge } from "@/core/ui/Badge";
import { Card } from "@/core/ui/Card";
import { Ionicons } from "@expo/vector-icons";
import { ListHeader } from "@/core/ui/ListHeader";
import React from "react";
import { Screen } from "@/core/ui/Screen";
import { demoEquipments } from "@/mocks/demo-data";

export function EquipmentScreen() {
  return (
    <Screen>
      <ListHeader
        title="L'Office 🍽️"
        subtitle="Matériel brassicole disponible"
      />

      <FlatList
        data={demoEquipments}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
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
                  <Text style={styles.cardTitle}>{item.name}</Text>
                  <Badge label={item.type} variant="info" />
                </View>
                <Text style={styles.meta}>
                  {item.volumeLiters} L • {item.efficiencyPercent}% eff.
                </Text>
                {item.notes ? (
                  <Text style={styles.notes}>{item.notes}</Text>
                ) : null}
              </View>
            </View>
          </Card>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: {
    paddingBottom: spacing.md,
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
  notes: {
    marginTop: spacing.xxs,
    color: colors.neutral.muted,
    fontSize: typography.size.caption,
    lineHeight: typography.lineHeight.caption,
  },
});
