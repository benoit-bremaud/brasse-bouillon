import {
  HopAddition,
  calculateAbv,
  calculateIbuTinseth,
  gallonsToLiters,
  litersToGallons,
  platoToSg,
  sgToPlato,
} from "@/core/brewing-calculations";
import { colors, radius, spacing, typography } from "@/core/theme";
import React, { useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import { Card } from "@/core/ui/Card";
import { ListHeader } from "@/core/ui/ListHeader";
import { PrimaryButton } from "@/core/ui/PrimaryButton";
import { Screen } from "@/core/ui/Screen";

type Props = {
  sourceType?: "recipe" | "batch";
  sourceId?: string;
};

function parseNumber(value: string, fallback = 0) {
  const parsed = Number(value.replace(",", "."));
  return Number.isFinite(parsed) ? parsed : fallback;
}

function round(value: number, decimals: number) {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

const numericInputProps = {
  keyboardType: "decimal-pad" as const,
  autoCorrect: false,
  autoCapitalize: "none" as const,
};

export function BrewingToolsScreen({ sourceType, sourceId }: Props) {
  const [og, setOg] = useState("1.050");
  const [fg, setFg] = useState("1.010");
  const [volumeLiters, setVolumeLiters] = useState("20");
  const [boilGravity, setBoilGravity] = useState("1.050");
  const [hopWeight, setHopWeight] = useState("25");
  const [hopAlpha, setHopAlpha] = useState("10");
  const [hopTime, setHopTime] = useState("60");

  const hops = useMemo<HopAddition[]>(
    () => [
      {
        weightGrams: parseNumber(hopWeight),
        alphaAcidPercent: parseNumber(hopAlpha),
        boilTimeMinutes: parseNumber(hopTime),
      },
    ],
    [hopWeight, hopAlpha, hopTime],
  );

  const abv = calculateAbv(parseNumber(og), parseNumber(fg));
  const ibu = calculateIbuTinseth(
    parseNumber(volumeLiters),
    parseNumber(boilGravity),
    hops,
  );
  const ogPlato = sgToPlato(parseNumber(og));
  const volumeGallons = litersToGallons(parseNumber(volumeLiters));
  const sgFromPlato = platoToSg(ogPlato);
  const litersFromGallons = gallonsToLiters(volumeGallons);

  const sourceLabel = sourceType
    ? `Pré-remplissage: ${sourceType}${sourceId ? ` (${sourceId.slice(0, 8)})` : ""}`
    : "Mode manuel";

  return (
    <Screen>
      <ListHeader
        title="Outils brassage"
        subtitle="IBU, ABV et conversions (V1)"
      />

      <Card style={styles.sourceCard}>
        <Text style={styles.sourceText}>{sourceLabel}</Text>
      </Card>

      <ScrollView contentContainerStyle={styles.content}>
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>ABV</Text>
          <View style={styles.row}>
            <View style={styles.field}>
              <Text style={styles.label}>OG (SG)</Text>
              <TextInput
                value={og}
                onChangeText={setOg}
                style={styles.input}
                {...numericInputProps}
              />
            </View>
            <View style={styles.field}>
              <Text style={styles.label}>FG (SG)</Text>
              <TextInput
                value={fg}
                onChangeText={setFg}
                style={styles.input}
                {...numericInputProps}
              />
            </View>
          </View>
          <Text style={styles.result}>ABV estimé: {round(abv, 1)}%</Text>
        </Card>

        <Card style={styles.card}>
          <Text style={styles.cardTitle}>IBU (Tinseth)</Text>
          <View style={styles.row}>
            <View style={styles.field}>
              <Text style={styles.label}>Volume (L)</Text>
              <TextInput
                value={volumeLiters}
                onChangeText={setVolumeLiters}
                style={styles.input}
                {...numericInputProps}
              />
            </View>
            <View style={styles.field}>
              <Text style={styles.label}>Densité ébullition</Text>
              <TextInput
                value={boilGravity}
                onChangeText={setBoilGravity}
                style={styles.input}
                {...numericInputProps}
              />
            </View>
          </View>

          <Text style={styles.hopsTitle}>Ajout houblon</Text>
          <View style={styles.row}>
            <View style={styles.field}>
              <Text style={styles.label}>Poids (g)</Text>
              <TextInput
                value={hopWeight}
                onChangeText={setHopWeight}
                style={styles.input}
                {...numericInputProps}
              />
            </View>
            <View style={styles.field}>
              <Text style={styles.label}>Alpha acide (%)</Text>
              <TextInput
                value={hopAlpha}
                onChangeText={setHopAlpha}
                style={styles.input}
                {...numericInputProps}
              />
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Temps ébullition (min)</Text>
            <TextInput
              value={hopTime}
              onChangeText={setHopTime}
              style={styles.input}
              {...numericInputProps}
            />
          </View>

          <Text style={styles.result}>IBU estimé: {round(ibu, 1)}</Text>
        </Card>

        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Conversions</Text>
          <Text style={styles.meta}>OG en Plato: {round(ogPlato, 1)} °P</Text>
          <Text style={styles.meta}>
            Plato reconverti: {round(sgFromPlato, 3)} SG
          </Text>
          <Text style={styles.meta}>
            Volume en gallons US: {round(volumeGallons, 2)} gal
          </Text>
          <Text style={styles.meta}>
            Gallons reconvertis: {round(litersFromGallons, 2)} L
          </Text>
        </Card>

        <PrimaryButton
          label="Réinitialiser"
          onPress={() => {
            setOg("1.050");
            setFg("1.010");
            setVolumeLiters("20");
            setBoilGravity("1.050");
            setHopWeight("25");
            setHopAlpha("10");
            setHopTime("60");
          }}
        />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  sourceCard: {
    marginBottom: spacing.sm,
  },
  sourceText: {
    color: colors.neutral.textSecondary,
    fontSize: typography.size.caption,
    lineHeight: typography.lineHeight.caption,
  },
  content: {
    paddingBottom: spacing.lg,
  },
  card: {
    marginBottom: spacing.sm,
  },
  cardTitle: {
    color: colors.neutral.textPrimary,
    fontSize: typography.size.body,
    lineHeight: typography.lineHeight.body,
    fontWeight: typography.weight.bold,
    marginBottom: spacing.xs,
  },
  row: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  field: {
    flex: 1,
    marginBottom: spacing.xs,
  },
  label: {
    color: colors.neutral.textSecondary,
    fontSize: typography.size.caption,
    lineHeight: typography.lineHeight.caption,
    marginBottom: spacing.xxs,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.neutral.border,
    borderRadius: radius.sm,
    backgroundColor: colors.neutral.white,
    color: colors.neutral.textPrimary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    fontSize: typography.size.label,
    lineHeight: typography.lineHeight.label,
    fontWeight: typography.weight.regular,
  },
  hopsTitle: {
    marginTop: spacing.xs,
    marginBottom: spacing.xs,
    color: colors.neutral.textPrimary,
    fontWeight: typography.weight.medium,
    fontSize: typography.size.label,
    lineHeight: typography.lineHeight.label,
  },
  result: {
    marginTop: spacing.xs,
    color: colors.brand.secondary,
    fontWeight: typography.weight.bold,
    fontSize: typography.size.body,
    lineHeight: typography.lineHeight.body,
  },
  meta: {
    color: colors.neutral.textSecondary,
    marginTop: spacing.xxs,
    fontSize: typography.size.label,
    lineHeight: typography.lineHeight.label,
  },
});
