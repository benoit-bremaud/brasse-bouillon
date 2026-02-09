import { FlatList, StyleSheet, Text, View } from "react-native";

import { Badge } from "@/core/ui/Badge";
import { Card } from "@/core/ui/Card";
import { ListHeader } from "@/core/ui/ListHeader";
import { Screen } from "@/core/ui/Screen";
import { demoUsers } from "@/mocks/demo-data";
import React from "react";

export function UsersScreen() {
  return (
    <Screen>
      <ListHeader title="Profils" subtitle="Utilisateurs fictifs" />

      <FlatList
        data={demoUsers}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>
                {item.firstName} {item.lastName}
              </Text>
              <Badge label={item.role} variant="info" />
            </View>
            <Text style={styles.meta}>@{item.username}</Text>
            <Text style={styles.meta}>{item.email}</Text>
            <Text style={styles.meta}>
              Statut: {item.isActive ? "Actif" : "Inactif"}
            </Text>
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  meta: {
    marginTop: 6,
    color: "#6b7280",
  },
});
