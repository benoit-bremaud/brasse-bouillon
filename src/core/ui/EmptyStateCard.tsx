import { StyleSheet, Text, View } from 'react-native';

import { Card } from '@/core/ui/Card';
import React from 'react';

type Props = {
  title: string;
  description?: string;
  action?: React.ReactNode;
};

export function EmptyStateCard({ title, description, action }: Props) {
  return (
    <Card style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      {description ? (
        <Text style={styles.description}>{description}</Text>
      ) : null}
      {action ? <View style={styles.action}>{action}</View> : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
  },
  title: {
    color: '#111827',
    fontWeight: '700',
    marginBottom: 6,
  },
  description: {
    color: '#6b7280',
  },
  action: {
    marginTop: 12,
    alignSelf: 'flex-start',
  },
});
