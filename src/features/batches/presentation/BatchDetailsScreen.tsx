import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Screen } from '@/core/ui/Screen';
import {
  completeCurrentStep,
  getMineById,
} from '@/features/batches/data/batches.api';
import { Batch } from '@/features/batches/domain/batch.types';

type Props = {
  batchId: string;
};

export function BatchDetailsScreen({ batchId }: Props) {
  const [batch, setBatch] = useState<Batch | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBatch = async () => {
    if (!batchId) {
      setError('Missing batch id.');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const data = await getMineById(batchId);
      setBatch(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load batch');
    } finally {
      setIsLoading(false);
    }
  };

  const handleComplete = async () => {
    if (!batchId) {
      return;
    }
    setIsCompleting(true);
    try {
      const data = await completeCurrentStep(batchId);
      setBatch(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to complete step',
      );
    } finally {
      setIsCompleting(false);
    }
  };

  useEffect(() => {
    fetchBatch();
  }, [batchId]);

  const isCompleted = batch?.status === 'completed';

  return (
    <Screen>
      {isLoading ? <ActivityIndicator /> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}

      {batch ? (
        <View style={styles.header}>
          <Text style={styles.title}>Batch {batch.id.slice(0, 8)}</Text>
          <Text style={styles.meta}>Status: {batch.status}</Text>
          <Text style={styles.meta}>
            Current step: {batch.currentStepOrder ?? '-'}
          </Text>
        </View>
      ) : null}

      <Pressable
        style={({ pressed }) => [
          styles.primaryButton,
          pressed && styles.primaryButtonPressed,
          isCompleted && styles.primaryButtonDisabled,
        ]}
        onPress={handleComplete}
        disabled={isCompleting || isCompleted || isLoading}>
        <Text style={styles.primaryButtonText}>
          {isCompleted
            ? 'Batch completed'
            : isCompleting
            ? 'Completing...'
            : 'Complete current step'}
        </Text>
      </Pressable>

      <Text style={styles.sectionTitle}>Steps</Text>
      <FlatList
        data={batch?.steps ?? []}
        keyExtractor={(item) => `${item.batchId}-${item.stepOrder}`}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.stepCard}>
            <Text style={styles.stepTitle}>
              {item.stepOrder + 1}. {item.label}
            </Text>
            <Text style={styles.stepMeta}>
              {item.type} · {item.status}
            </Text>
            {item.description ? (
              <Text style={styles.stepDescription}>{item.description}</Text>
            ) : null}
          </View>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  meta: {
    color: '#6b7280',
    marginTop: 4,
  },
  sectionTitle: {
    marginTop: 16,
    marginBottom: 8,
    fontWeight: '600',
  },
  list: {
    paddingBottom: 24,
  },
  stepCard: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  stepTitle: {
    fontWeight: '600',
  },
  stepMeta: {
    color: '#6b7280',
    fontSize: 12,
    marginTop: 2,
  },
  stepDescription: {
    marginTop: 6,
  },
  primaryButton: {
    backgroundColor: '#111827',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  primaryButtonPressed: {
    opacity: 0.8,
  },
  primaryButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  error: {
    color: '#dc2626',
    marginBottom: 8,
  },
});
