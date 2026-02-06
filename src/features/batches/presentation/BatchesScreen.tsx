import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';

import { Screen } from '@/core/ui/Screen';
import { listMine } from '@/features/batches/data/batches.api';
import { BatchSummary } from '@/features/batches/domain/batch.types';

export function BatchesScreen() {
  const router = useRouter();
  const [batches, setBatches] = useState<BatchSummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBatches = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await listMine();
      setBatches(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load batches');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBatches();
  }, []);

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.title}>My Batches</Text>
        <Pressable onPress={fetchBatches} style={styles.refreshButton}>
          <Text style={styles.refreshText}>Refresh</Text>
        </Pressable>
      </View>

      {isLoading ? <ActivityIndicator /> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}

      {!isLoading && batches.length === 0 ? (
        <Text style={styles.empty}>No batches started yet.</Text>
      ) : null}

      <FlatList
        data={batches}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Pressable
            style={styles.card}
            onPress={() => router.push(`/(app)/batches/${item.id}`)}>
            <Text style={styles.cardTitle}>Batch {item.id.slice(0, 8)}</Text>
            <Text style={styles.cardMeta}>Status: {item.status}</Text>
            <Text style={styles.cardMeta}>
              Current step: {item.currentStepOrder ?? '-'}
            </Text>
          </Pressable>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  refreshButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#111827',
  },
  refreshText: {
    color: '#fff',
    fontSize: 12,
  },
  list: {
    paddingBottom: 16,
  },
  card: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  cardMeta: {
    marginTop: 4,
    color: '#6b7280',
  },
  empty: {
    color: '#6b7280',
    marginTop: 12,
  },
  error: {
    color: '#dc2626',
    marginBottom: 8,
  },
});
