import { FlatList, StyleSheet, Text, View } from 'react-native';

import { Badge } from '@/core/ui/Badge';
import { Card } from '@/core/ui/Card';
import { ListHeader } from '@/core/ui/ListHeader';
import { Screen } from '@/core/ui/Screen';
import { demoEquipments } from '@/mocks/demo-data';
import React from 'react';

export function EquipmentScreen() {
  return (
    <Screen>
      <ListHeader
        title="Équipements"
        subtitle="Inventaire fictif pour la démo"
      />

      <FlatList
        data={demoEquipments}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>{item.name}</Text>
              <Badge label={item.type} variant="info" />
            </View>
            <Text style={styles.meta}>Volume: {item.volumeLiters} L</Text>
            <Text style={styles.meta}>
              Rendement: {item.efficiencyPercent}%
            </Text>
            {item.notes ? (
              <Text style={styles.notes}>Notes: {item.notes}</Text>
            ) : null}
          </Card>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: {
    paddingBottom: 16,
  },
  card: {
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  meta: {
    marginTop: 8,
    color: '#6b7280',
  },
  notes: {
    marginTop: 8,
    color: '#4b5563',
  },
});
