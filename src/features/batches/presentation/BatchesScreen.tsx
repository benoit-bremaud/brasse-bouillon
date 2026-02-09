import React, { useEffect, useState } from "react";
import {
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { getErrorMessage } from "@/core/http/http-error";
import { Badge } from "@/core/ui/Badge";
import { Card } from "@/core/ui/Card";
import { EmptyStateCard } from "@/core/ui/EmptyStateCard";
import { ListHeader } from "@/core/ui/ListHeader";
import { PrimaryButton } from "@/core/ui/PrimaryButton";
import { Screen } from "@/core/ui/Screen";
import { listBatches } from "@/features/batches/application/batches.use-cases";
import { BatchSummary } from "@/features/batches/domain/batch.types";
import { useRouter } from "expo-router";

export function BatchesScreen() {
  const router = useRouter();
  const [batches, setBatches] = useState<BatchSummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBatches = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await listBatches();
      setBatches(data);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to load batches"));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBatches();
  }, []);

  const showEmptyState = !isLoading && batches.length === 0;

  return (
    <Screen
      isLoading={isLoading && batches.length === 0}
      error={error}
      onRetry={fetchBatches}
    >
      <ListHeader
        title="My Batches"
        subtitle="Suivi de tes brassins en cours"
        action={
          <Pressable onPress={fetchBatches} style={styles.refreshButton}>
            <Text style={styles.refreshText}>Refresh</Text>
          </Pressable>
        }
      />

      {showEmptyState ? (
        <EmptyStateCard
          title="Aucun batch démarré"
          description="Lance un batch depuis une recette."
          action={
            <PrimaryButton label="Recharger la liste" onPress={fetchBatches} />
          }
        />
      ) : null}

      <FlatList
        data={batches}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={fetchBatches} />
        }
        renderItem={({ item }) => (
          <Pressable onPress={() => router.push(`/(app)/batches/${item.id}`)}>
            <Card style={styles.card}>
              <View style={styles.cardTopRow}>
                <Text style={styles.cardTitle}>
                  Batch {item.id.slice(0, 8)}
                </Text>
                <Badge
                  label={item.status}
                  variant={item.status === "completed" ? "success" : "info"}
                />
              </View>
              <Text style={styles.cardMeta}>
                Étape courante: {item.currentStepOrder ?? "-"}
              </Text>
              <Text style={styles.cardMetaSecondary}>Ouvrir le détail →</Text>
            </Card>
          </Pressable>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  refreshButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: "#111827",
  },
  refreshText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  list: {
    paddingBottom: 16,
  },
  card: {
    marginBottom: 12,
  },
  cardTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  cardMeta: {
    marginTop: 10,
    color: "#6b7280",
  },
  cardMetaSecondary: {
    marginTop: 6,
    color: "#9ca3af",
    fontSize: 13,
  },
});
