import { Pressable, StyleSheet, TextInput, View } from "react-native";

import { Ionicons } from "@expo/vector-icons";
import React from "react";

import { colors, radius, spacing, typography } from "@/core/theme";

import { SEARCH_PLACEHOLDER } from "@/features/beer-catalog/presentation/beer-catalog.constants";

type Props = {
  value: string;
  onChangeText: (text: string) => void;
};

/**
 * Controlled search input — dumb on purpose: the debounce lives in the
 * screen (`useDebouncedValue`), per `mobile-catalog/08-state-search-input.md`.
 * `maxLength` 100 mirrors the API validation on `q`.
 */
export function SearchField({ value, onChangeText }: Props) {
  return (
    <View style={styles.container}>
      <Ionicons
        name="search-outline"
        size={18}
        color={colors.neutral.muted}
        style={styles.icon}
      />
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={SEARCH_PLACEHOLDER}
        placeholderTextColor={colors.neutral.muted}
        autoCorrect={false}
        autoCapitalize="none"
        returnKeyType="search"
        maxLength={100}
        accessibilityLabel="Rechercher une bière par nom"
        testID="beer-search-input"
      />
      {value.length > 0 ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Effacer la recherche"
          onPress={() => onChangeText("")}
          testID="beer-search-clear"
        >
          <Ionicons
            name="close-circle"
            size={18}
            color={colors.neutral.muted}
          />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.neutral.white,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    marginBottom: spacing.sm,
  },
  icon: {
    marginRight: spacing.xs,
  },
  input: {
    flex: 1,
    minWidth: 0,
    color: colors.neutral.textPrimary,
    fontSize: typography.size.body,
    paddingVertical: 0,
  },
});
