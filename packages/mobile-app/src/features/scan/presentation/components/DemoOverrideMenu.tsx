import React, { useMemo } from "react";
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { colors, radius, spacing, typography } from "@/core/theme";
import type { ScanCatalogItem } from "@/features/scan/domain/scan.types";
import { demoScanCatalog } from "@/mocks/demo-data";

/**
 * DemoOverrideMenu — soutenance backup (#642).
 *
 * Hidden modal accessible via a long-press gesture on the scan
 * screen header help button. Lists all beers from the demo catalog
 * and, on tap, navigates the screen to the corresponding info card
 * exactly as if the user had scanned the matching barcode.
 *
 * Intended use: stage emergency. If the live camera misfires or
 * the demo bottle is missing on stage, the speaker triggers this
 * menu and forces the result on a known beer to keep the demo
 * flowing. Hidden from normal users — long-press is undocumented.
 *
 * Stays mounted in production builds (the gesture itself is the
 * gate). No env-var protection on purpose: the speaker may need it
 * regardless of build profile.
 */

type Props = Readonly<{
  visible: boolean;
  onClose: () => void;
  onSelectBeer: (barcode: string) => void;
}>;

export function DemoOverrideMenu({ visible, onClose, onSelectBeer }: Props) {
  const beers = useMemo<ScanCatalogItem[]>(
    () =>
      Object.values(demoScanCatalog).sort((a, b) =>
        a.name.localeCompare(b.name),
      ),
    [],
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      accessibilityViewIsModal
    >
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.title}>Démo — bières seedées</Text>
            <Text style={styles.subtitle}>
              Tape une bière pour forcer le résultat du scan.
            </Text>
          </View>

          <FlatList
            data={beers}
            keyExtractor={(item) => item.barcode}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            renderItem={({ item }) => (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Forcer ${item.name} (${item.brewery})`}
                onPress={() => onSelectBeer(item.barcode)}
                style={({ pressed }) => [
                  styles.row,
                  pressed ? styles.rowPressed : null,
                ]}
              >
                <Text style={styles.rowName}>{item.name}</Text>
                <Text style={styles.rowMeta}>
                  {item.brewery}
                  {item.style ? ` · ${item.style}` : ""}
                  {item.abv != null ? ` · ${item.abv.toFixed(1)} %` : ""}
                </Text>
                <Text style={styles.rowBarcode}>{item.barcode}</Text>
              </Pressable>
            )}
          />

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Fermer le menu démo"
            onPress={onClose}
            style={({ pressed }) => [
              styles.cancelButton,
              pressed ? styles.cancelPressed : null,
            ]}
          >
            <Text style={styles.cancelText}>Annuler</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: colors.neutral.white,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
    maxHeight: "75%",
  },
  header: {
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.border,
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: typography.size.h2,
    lineHeight: typography.lineHeight.h2,
    fontWeight: typography.weight.bold,
    color: colors.neutral.textPrimary,
  },
  subtitle: {
    marginTop: spacing.xxs,
    fontSize: typography.size.label,
    color: colors.neutral.textSecondary,
  },
  separator: {
    height: 1,
    backgroundColor: colors.neutral.border,
  },
  row: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  rowPressed: {
    backgroundColor: colors.state.infoBackground,
  },
  rowName: {
    fontSize: typography.size.body,
    lineHeight: typography.lineHeight.body,
    fontWeight: typography.weight.medium,
    color: colors.neutral.textPrimary,
  },
  rowMeta: {
    marginTop: spacing.xxs,
    fontSize: typography.size.caption,
    color: colors.neutral.textSecondary,
  },
  rowBarcode: {
    marginTop: spacing.xxs,
    fontSize: typography.size.caption,
    color: colors.neutral.muted,
    fontVariant: ["tabular-nums"],
  },
  cancelButton: {
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.brand.primary,
    alignItems: "center",
  },
  cancelPressed: {
    opacity: 0.7,
  },
  cancelText: {
    color: colors.brand.primary,
    fontSize: typography.size.label,
    fontWeight: typography.weight.medium,
  },
});
