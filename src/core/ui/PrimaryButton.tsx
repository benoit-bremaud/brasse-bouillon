import {
  Pressable,
  PressableProps,
  StyleSheet,
  Text,
  ViewStyle,
} from "react-native";

import React from "react";

type Props = PressableProps & {
  label: string;
  disabled?: boolean;
  style?: ViewStyle | ViewStyle[];
};

export function PrimaryButton({ label, style, disabled, ...rest }: Props) {
  return (
    <Pressable
      {...rest}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        pressed && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
    >
      <Text style={styles.text}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: "#111827",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 2,
  },
  pressed: {
    opacity: 0.8,
  },
  disabled: {
    backgroundColor: "#9ca3af",
  },
  text: {
    color: "#fff",
    fontWeight: "600",
  },
});
