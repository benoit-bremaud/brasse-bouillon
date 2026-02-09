import { FlatList, StyleSheet, Text, View } from 'react-native';

import { Badge } from '@/core/ui/Badge';
import { Card } from '@/core/ui/Card';
import { ListHeader } from '@/core/ui/ListHeader';
import { Screen } from '@/core/ui/Screen';
import { demoIngredients } from '@/mocks/demo-data';
import React from 'react';

export function IngredientsScreen() {
  return (
    <Screen>
      <ListHeader
        title="Ingrédients"
        subtitle="Catalogue fictif pour la démo"
      />

      <FlatList
        data={demoIngredients}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>{item.name}</Text>
              <Badge label={item.category} variant="neutral" />
            </View>
            <Text style={styles.meta}>Usage: {item.usage}</Text>
            {item.origin ? (
              <Text style={styles.meta}>Origine: {item.origin}</Text>
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
});
