import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import React, { useCallback, useMemo, useState } from "react";
import { colors, radius, spacing, typography } from "@/core/theme";
import {
  listPendingScans,
  purgeScanLocalData,
} from "@/features/scan/application/scan.use-cases";

import { Card } from "@/core/ui/Card";
import { EmptyStateCard } from "@/core/ui/EmptyStateCard";
import { HeaderBackButton } from "@/core/ui/HeaderBackButton";
import { ListHeader } from "@/core/ui/ListHeader";
import { PrimaryButton } from "@/core/ui/PrimaryButton";
import type { ScanPendingCapture } from "@/features/scan/domain/scan.types";
import { Screen } from "@/core/ui/Screen";
import { getErrorMessage } from "@/core/http/http-error";
import { useRouter } from "expo-router";

const INITIAL_VISIBLE_PENDING_ITEMS = 3;

function toYesNo(value: boolean): string {
  return value ? "yes" : "no";
}

export function PendingScansScreen() {
  const router = useRouter();
  const [pendingCaptures, setPendingCaptures] = useState<ScanPendingCapture[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasFetched, setHasFetched] = useState(false);
  const [visibleCount, setVisibleCount] = useState(
    INITIAL_VISIBLE_PENDING_ITEMS,
  );
  const [isPurging, setIsPurging] = useState(false);

  const loadPendingCaptures = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const captures = await listPendingScans();
      setPendingCaptures(captures);
    } catch (loadError) {
      setError(getErrorMessage(loadError, "Unable to load pending scans."));
    } finally {
      setIsLoading(false);
      setHasFetched(true);
    }
  }, []);

  React.useEffect(() => {
    void loadPendingCaptures();
  }, [loadPendingCaptures]);

  const visibleCaptures = useMemo(
    () => pendingCaptures.slice(0, visibleCount),
    [pendingCaptures, visibleCount],
  );
  const hasMoreCaptures = pendingCaptures.length > visibleCount;

  const handlePurgeLocalData = async () => {
    setIsPurging(true);

    try {
      await purgeScanLocalData();
      setPendingCaptures([]);
      setVisibleCount(INITIAL_VISIBLE_PENDING_ITEMS);
    } catch (purgeError) {
      setError(getErrorMessage(purgeError, "Unable to purge local scan data."));
    } finally {
      setIsPurging(false);
    }
  };

  return (
    <Screen
      isLoading={isLoading}
      error={error}
      onRetry={() => {
        void loadPendingCaptures();
      }}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <ListHeader
          title="Pending scans"
          subtitle="Stored locally for later product analysis"
          action={
            <HeaderBackButton
              label="Scanner"
              accessibilityLabel="Go back to scanner"
              onPress={() => router.replace("/(app)/dashboard/scan" as never)}
            />
          }
        />

        <Card style={styles.topCard}>
          <Text style={styles.topCardTitle}>Local data summary</Text>
          <Text style={styles.topCardText}>
            {pendingCaptures.length} pending capture
            {pendingCaptures.length > 1 ? "s" : ""} currently stored on this
            device.
          </Text>
          <Text style={styles.topCardText}>
            You can purge local scan data at any time.
          </Text>
          <PrimaryButton
            label={isPurging ? "Purging..." : "Purge local scan data"}
            disabled={isPurging || pendingCaptures.length === 0}
            onPress={() => {
              void handlePurgeLocalData();
            }}
          />
        </Card>

        {hasFetched && pendingCaptures.length === 0 ? (
          <EmptyStateCard
            title="No pending scan"
            description="All scans are matched or local storage is empty."
          />
        ) : (
          <Card>
            <Text style={styles.sectionTitle}>Pending captures</Text>

            <View style={styles.captureList}>
              {visibleCaptures.map((capture) => (
                <View key={capture.id} style={styles.captureItem}>
                  <View style={styles.captureHeader}>
                    <Text style={styles.captureId}>{capture.id}</Text>
                    <Text style={styles.captureDate}>
                      {capture.createdAtIso}
                    </Text>
                  </View>

                  <Text style={styles.captureMeta}>
                    Barcode: {capture.barcodeValue ?? "none"}
                  </Text>
                  <Text style={styles.captureMeta}>
                    Front photo: {capture.frontPhotoUri ?? "none"}
                  </Text>
                  <Text style={styles.captureMeta}>
                    Back photo: {capture.backPhotoUri ?? "none"}
                  </Text>
                  <Text style={styles.captureMeta}>
                    Back label missing:{" "}
                    {toYesNo(Boolean(capture.backLabelMissing))}
                  </Text>
                  <Text style={styles.captureConsent}>
                    Consent snapshot • barcode:{" "}
                    {toYesNo(capture.consentSnapshot.storeBarcodeValue)} •
                    photos: {toYesNo(capture.consentSnapshot.storeBottlePhotos)}{" "}
                    • metadata:{" "}
                    {toYesNo(capture.consentSnapshot.storeScanMetadata)} •
                    training:{" "}
                    {toYesNo(capture.consentSnapshot.useDataForModelTraining)}
                  </Text>
                  <Text style={styles.captureMetadata}>{capture.metadata}</Text>
                </View>
              ))}
            </View>

            {hasMoreCaptures ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Show more pending captures"
                style={styles.showMoreButton}
                onPress={() =>
                  setVisibleCount(
                    (currentCount) =>
                      currentCount + INITIAL_VISIBLE_PENDING_ITEMS,
                  )
                }
              >
                <Text style={styles.showMoreButtonText}>Show more</Text>
              </Pressable>
            ) : null}
          </Card>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: spacing.xl,
    gap: spacing.sm,
  },
  topCard: {
    gap: spacing.sm,
  },
  topCardTitle: {
    color: colors.neutral.textPrimary,
    fontSize: typography.size.body,
    lineHeight: typography.lineHeight.body,
    fontWeight: typography.weight.bold,
  },
  topCardText: {
    color: colors.neutral.textSecondary,
    fontSize: typography.size.label,
    lineHeight: typography.lineHeight.label,
  },
  sectionTitle: {
    marginBottom: spacing.sm,
    color: colors.neutral.textPrimary,
    fontSize: typography.size.body,
    lineHeight: typography.lineHeight.body,
    fontWeight: typography.weight.bold,
  },
  captureList: {
    gap: spacing.sm,
  },
  captureItem: {
    borderWidth: 1,
    borderColor: colors.neutral.border,
    borderRadius: radius.md,
    padding: spacing.sm,
    gap: spacing.xxs,
  },
  captureHeader: {
    gap: spacing.xxs,
    marginBottom: spacing.xxs,
  },
  captureId: {
    color: colors.neutral.textPrimary,
    fontSize: typography.size.label,
    lineHeight: typography.lineHeight.label,
    fontWeight: typography.weight.bold,
  },
  captureDate: {
    color: colors.neutral.muted,
    fontSize: typography.size.caption,
    lineHeight: typography.lineHeight.caption,
  },
  captureMeta: {
    color: colors.neutral.textSecondary,
    fontSize: typography.size.caption,
    lineHeight: typography.lineHeight.caption,
  },
  captureMetadata: {
    marginTop: spacing.xs,
    color: colors.neutral.textPrimary,
    fontSize: typography.size.caption,
    lineHeight: typography.lineHeight.caption,
  },
  captureConsent: {
    marginTop: spacing.xxs,
    color: colors.neutral.muted,
    fontSize: typography.size.caption,
    lineHeight: typography.lineHeight.caption,
  },
  showMoreButton: {
    marginTop: spacing.sm,
    alignSelf: "center",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  showMoreButtonText: {
    color: colors.brand.secondary,
    fontSize: typography.size.caption,
    lineHeight: typography.lineHeight.caption,
    fontWeight: typography.weight.medium,
  },
});
