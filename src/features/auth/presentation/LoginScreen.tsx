import { colors, radius, shadows, spacing, typography } from "@/core/theme";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { useAuth } from "@/core/auth/auth-context";
import { BrandLogo } from "@/core/ui/BrandLogo";
import { Screen } from "@/core/ui/Screen";

export function LoginScreen() {
  const { login, isLoading, error } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);

  const onSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      setLocalError("Email and password are required.");
      return;
    }
    setLocalError(null);
    await login(email.trim(), password);
  };

  return (
    <Screen>
      <View style={styles.container}>
        <BrandLogo size={84} style={styles.logo} />
        <Text style={styles.title}>Brasse Bouillon</Text>
        <Text style={styles.subtitle}>Sign in to continue</Text>

        <TextInput
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          placeholder="Email"
          placeholderTextColor={colors.neutral.muted}
          style={styles.input}
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          placeholder="Password"
          placeholderTextColor={colors.neutral.muted}
          secureTextEntry
          style={styles.input}
          value={password}
          onChangeText={setPassword}
        />

        {localError ? <Text style={styles.error}>{localError}</Text> : null}
        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Pressable
          style={({ pressed }) => [
            styles.button,
            pressed && styles.buttonPressed,
          ]}
          onPress={onSubmit}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color={colors.neutral.white} />
          ) : (
            <Text style={styles.buttonText}>Login</Text>
          )}
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
  },
  logo: {
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: typography.size.h1,
    lineHeight: typography.lineHeight.h1,
    color: colors.neutral.textPrimary,
    fontWeight: typography.weight.bold,
    marginBottom: spacing.xxs,
  },
  subtitle: {
    color: colors.neutral.textSecondary,
    marginBottom: spacing.lg,
    fontSize: typography.size.label,
    lineHeight: typography.lineHeight.label,
    fontWeight: typography.weight.regular,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.neutral.border,
    color: colors.neutral.textPrimary,
    backgroundColor: colors.neutral.white,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    marginBottom: spacing.sm,
    fontSize: typography.size.body,
    lineHeight: typography.lineHeight.body,
    fontWeight: typography.weight.regular,
  },
  button: {
    backgroundColor: colors.brand.primary,
    paddingVertical: spacing.sm,
    borderRadius: radius.sm,
    alignItems: "center",
    marginTop: spacing.xs,
    ...shadows.sm,
  },
  buttonPressed: {
    opacity: 0.9,
  },
  buttonText: {
    color: colors.neutral.white,
    fontWeight: typography.weight.medium,
    fontSize: typography.size.label,
    lineHeight: typography.lineHeight.label,
  },
  error: {
    color: colors.semantic.error,
    marginBottom: spacing.xs,
    fontSize: typography.size.caption,
    lineHeight: typography.lineHeight.caption,
    fontWeight: typography.weight.medium,
  },
});
