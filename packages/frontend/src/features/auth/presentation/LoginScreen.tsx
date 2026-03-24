import { colors, radius, shadows, spacing, typography } from "@/core/theme";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { useAuth } from "@/core/auth/auth-context";
import { BrandLogo } from "@/core/ui/BrandLogo";
import { Screen } from "@/core/ui/Screen";

type AuthMode = "login" | "signup" | "forgot";

const emailRegex = /^\S+@\S+\.\S+$/;

export function LoginScreen() {
  const {
    login,
    signup,
    requestPasswordReset,
    loginWithDemoAccount,
    isLoading,
    error,
  } = useAuth();

  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [username, setUsername] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);
  const [localInfo, setLocalInfo] = useState<string | null>(null);

  const clearFeedback = () => {
    setLocalError(null);
    setLocalInfo(null);
  };

  const onSwitchMode = (nextMode: AuthMode) => {
    setMode(nextMode);
    clearFeedback();
  };

  const validateEmail = (value: string) => emailRegex.test(value.trim());

  const onLoginSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      setLocalError("Email et mot de passe requis.");
      return;
    }

    if (!validateEmail(email)) {
      setLocalError("Merci de renseigner un email valide.");
      return;
    }

    clearFeedback();

    try {
      await login(email.trim(), password);
    } catch {
      // handled in auth context
    }
  };

  const onSignupSubmit = async () => {
    if (!email.trim() || !password.trim() || !username.trim()) {
      setLocalError("Email, mot de passe et nom d’utilisateur requis.");
      return;
    }

    if (!validateEmail(email)) {
      setLocalError("Merci de renseigner un email valide.");
      return;
    }

    if (password.length < 8) {
      setLocalError("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }

    if (password !== confirmPassword) {
      setLocalError("Les mots de passe ne correspondent pas.");
      return;
    }

    clearFeedback();

    try {
      await signup({
        email: email.trim(),
        password,
        username: username.trim(),
        firstName: firstName.trim() || undefined,
        lastName: lastName.trim() || undefined,
      });
    } catch {
      // handled in auth context
    }
  };

  const onForgotPasswordSubmit = async () => {
    if (!email.trim()) {
      setLocalError("Merci de renseigner un email.");
      return;
    }

    if (!validateEmail(email)) {
      setLocalError("Merci de renseigner un email valide.");
      return;
    }

    clearFeedback();

    try {
      await requestPasswordReset(email.trim());
      setLocalInfo(
        "Si un compte existe pour cet email, un lien de réinitialisation vient d’être envoyé.",
      );
    } catch {
      // handled in auth context
    }
  };

  const onDemoSubmit = async () => {
    clearFeedback();

    try {
      await loginWithDemoAccount();
    } catch {
      // handled in auth context
    }
  };

  const onSubmit = async () => {
    if (mode === "signup") {
      await onSignupSubmit();
      return;
    }

    if (mode === "forgot") {
      await onForgotPasswordSubmit();
      return;
    }

    await onLoginSubmit();
  };

  const subtitle =
    mode === "login"
      ? "Connecte-toi pour continuer"
      : mode === "signup"
        ? "Crée ton compte pour démarrer"
        : "Reçois un lien de réinitialisation";

  const submitLabel =
    mode === "login"
      ? "Se connecter"
      : mode === "signup"
        ? "Créer mon compte"
        : "Envoyer le lien";

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <BrandLogo size={84} style={styles.logo} />
        <Text style={styles.title}>Brasse Bouillon</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>

        <View style={styles.tabs}>
          <Pressable
            style={[styles.tab, mode === "login" && styles.tabActive]}
            onPress={() => onSwitchMode("login")}
            disabled={isLoading}
          >
            <Text
              style={[styles.tabText, mode === "login" && styles.tabTextActive]}
            >
              Connexion
            </Text>
          </Pressable>
          <Pressable
            style={[styles.tab, mode === "signup" && styles.tabActive]}
            onPress={() => onSwitchMode("signup")}
            disabled={isLoading}
          >
            <Text
              style={[
                styles.tabText,
                mode === "signup" && styles.tabTextActive,
              ]}
            >
              Créer un compte
            </Text>
          </Pressable>
          <Pressable
            style={[styles.tab, mode === "forgot" && styles.tabActive]}
            onPress={() => onSwitchMode("forgot")}
            disabled={isLoading}
          >
            <Text
              style={[
                styles.tabText,
                mode === "forgot" && styles.tabTextActive,
              ]}
            >
              Mot de passe oublié
            </Text>
          </Pressable>
        </View>

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

        {mode === "signup" ? (
          <>
            <TextInput
              autoCapitalize="none"
              autoCorrect={false}
              placeholder="Nom d'utilisateur"
              placeholderTextColor={colors.neutral.muted}
              style={styles.input}
              value={username}
              onChangeText={setUsername}
            />
            <View style={styles.inlineInputs}>
              <TextInput
                autoCapitalize="words"
                placeholder="Prénom (optionnel)"
                placeholderTextColor={colors.neutral.muted}
                style={[styles.input, styles.inlineInput]}
                value={firstName}
                onChangeText={setFirstName}
              />
              <TextInput
                autoCapitalize="words"
                placeholder="Nom (optionnel)"
                placeholderTextColor={colors.neutral.muted}
                style={[styles.input, styles.inlineInput]}
                value={lastName}
                onChangeText={setLastName}
              />
            </View>
          </>
        ) : null}

        {mode !== "forgot" ? (
          <>
            <TextInput
              placeholder="Mot de passe"
              placeholderTextColor={colors.neutral.muted}
              secureTextEntry
              style={styles.input}
              value={password}
              onChangeText={setPassword}
            />
            {mode === "signup" ? (
              <TextInput
                placeholder="Confirmer le mot de passe"
                placeholderTextColor={colors.neutral.muted}
                secureTextEntry
                style={styles.input}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
            ) : null}
          </>
        ) : null}

        {localInfo ? <Text style={styles.info}>{localInfo}</Text> : null}
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
            <Text style={styles.buttonText}>{submitLabel}</Text>
          )}
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.secondaryButton,
            pressed && styles.buttonPressed,
          ]}
          onPress={onDemoSubmit}
          disabled={isLoading}
        >
          <Text style={styles.secondaryButtonText}>Connexion démo</Text>
        </Pressable>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
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
  tabs: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  tab: {
    borderWidth: 1,
    borderColor: colors.neutral.border,
    borderRadius: radius.sm,
    backgroundColor: colors.neutral.white,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  tabActive: {
    borderColor: colors.brand.primary,
    backgroundColor: colors.state.infoBackground,
  },
  tabText: {
    color: colors.neutral.textSecondary,
    fontSize: typography.size.caption,
    lineHeight: typography.lineHeight.caption,
    fontWeight: typography.weight.medium,
  },
  tabTextActive: {
    color: colors.brand.primary,
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
  inlineInputs: {
    flexDirection: "row",
    gap: spacing.xs,
  },
  inlineInput: {
    flex: 1,
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
  secondaryButton: {
    marginTop: spacing.xs,
    paddingVertical: spacing.sm,
    borderRadius: radius.sm,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.brand.secondary,
    backgroundColor: colors.neutral.white,
  },
  secondaryButtonText: {
    color: colors.brand.secondary,
    fontWeight: typography.weight.medium,
    fontSize: typography.size.label,
    lineHeight: typography.lineHeight.label,
  },
  info: {
    color: colors.semantic.success,
    marginBottom: spacing.xs,
    fontSize: typography.size.caption,
    lineHeight: typography.lineHeight.caption,
    fontWeight: typography.weight.medium,
  },
  error: {
    color: colors.semantic.error,
    marginBottom: spacing.xs,
    fontSize: typography.size.caption,
    lineHeight: typography.lineHeight.caption,
    fontWeight: typography.weight.medium,
  },
});
