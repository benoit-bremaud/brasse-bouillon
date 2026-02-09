import { StyleSheet, View, ViewProps } from "react-native";

import React from "react";

type Props = ViewProps & {
  variant?: "default" | "subtle";
};

export function Card({ style, variant = "default", ...rest }: Props) {
  return (
    <View
      {...rest}
      style={[styles.base, variant === "subtle" && styles.subtle, style]}
    />
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  subtle: {
    backgroundColor: "#f9fafb",
    borderColor: "#e5e7eb",
  },
});
