import { StyleSheet, Text, TextProps } from "react-native";

import React from "react";

type Variant = "neutral" | "info" | "success";

type Props = TextProps & {
  label: string;
  variant?: Variant;
};

const variantStyles: Record<Variant, { container: object; text: object }> = {
  neutral: {
    container: {
      backgroundColor: "#f3f4f6",
      borderColor: "#e5e7eb",
    },
    text: { color: "#4b5563" },
  },
  info: {
    container: {
      backgroundColor: "#ecfeff",
      borderColor: "#a5f3fc",
    },
    text: { color: "#155e75" },
  },
  success: {
    container: {
      backgroundColor: "#dcfce7",
      borderColor: "#86efac",
    },
    text: { color: "#166534" },
  },
};

export function Badge({ label, variant = "neutral", style, ...rest }: Props) {
  const selected = variantStyles[variant];
  return (
    <Text
      {...rest}
      style={[styles.base, selected.container, selected.text, style]}
    >
      {label.toUpperCase()}
    </Text>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
  },
});
