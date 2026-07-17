import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { useAuth } from "@/core/auth/auth-context";
import { getErrorMessage } from "@/core/http/http-error";
import { radius, spacing, typography, useTheme } from "@/core/theme";
import type { ThemeColors } from "@/core/theme";
import { HeaderBackButton } from "@/core/ui/HeaderBackButton";
import { PrimaryButton } from "@/core/ui/PrimaryButton";
import { Screen } from "@/core/ui/Screen";
import { ScreenScrollView } from "@/core/ui/ScreenScrollView";

type PasswordFieldProps = {
  label: string;
  accessibilityLabel: string;
  value: string;
  onChangeText: (value: string) => void;
};

function PasswordField({
  label,
  accessibilityLabel,
  value,
  onChangeText,
}: PasswordFieldProps) {
  const { colors: themeColors } = useTheme();
  const styles = useMemo(() => createStyles(themeColors), [themeColors]);

  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        accessibilityLabel={accessibilityLabel}
        autoCapitalize="none"
        autoComplete="password"
        onChangeText={onChangeText}
        secureTextEntry
        style={styles.input}
        value={value}
      />
    </View>
  );
}

export function ChangePasswordScreen() {
  const router = useRouter();
  const { changePassword, isLoading } = useAuth();
  const { colors: themeColors } = useTheme();
  const styles = useMemo(() => createStyles(themeColors), [themeColors]);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (isSaving) {
      return;
    }

    setErrorMessage(null);
    if (!currentPassword || !newPassword || !confirmation) {
      setErrorMessage("Complète les trois champs pour continuer.");
      return;
    }
    if (
      newPassword.length < 8 ||
      !/[a-z]/.test(newPassword) ||
      !/[A-Z]/.test(newPassword) ||
      !/\d/.test(newPassword) ||
      !/[!@#$%^&*]/.test(newPassword)
    ) {
      setErrorMessage(
        "Le nouveau mot de passe doit contenir 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial.",
      );
      return;
    }
    if (newPassword !== confirmation) {
      setErrorMessage("Les deux nouveaux mots de passe ne correspondent pas.");
      return;
    }

    setIsSaving(true);
    try {
      await changePassword({ currentPassword, newPassword });
      router.back();
    } catch (error) {
      setErrorMessage(
        getErrorMessage(error, "Impossible de modifier ton mot de passe."),
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Screen>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.keyboardView}
      >
        <ScreenScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <HeaderBackButton
            accessibilityLabel="Retour au profil"
            label="Profil"
            onPress={() => router.back()}
          />
          <View style={styles.intro}>
            <Text style={styles.title}>Modifier le mot de passe</Text>
            <Text style={styles.subtitle}>
              Utilise un mot de passe unique pour protéger ton compte.
            </Text>
          </View>
          <View style={styles.form}>
            <PasswordField
              accessibilityLabel="Mot de passe actuel"
              label="Mot de passe actuel"
              onChangeText={setCurrentPassword}
              value={currentPassword}
            />
            <PasswordField
              accessibilityLabel="Nouveau mot de passe"
              label="Nouveau mot de passe"
              onChangeText={setNewPassword}
              value={newPassword}
            />
            <PasswordField
              accessibilityLabel="Confirmer le nouveau mot de passe"
              label="Confirmer le nouveau mot de passe"
              onChangeText={setConfirmation}
              value={confirmation}
            />
          </View>
          <Text style={styles.helpText}>
            Minimum 8 caractères avec une majuscule, une minuscule, un chiffre
            et un caractère spécial.
          </Text>
          {errorMessage ? (
            <Text style={styles.error}>{errorMessage}</Text>
          ) : null}
          <PrimaryButton
            accessibilityLabel="Enregistrer le nouveau mot de passe"
            disabled={isLoading || isSaving}
            label={
              isLoading || isSaving
                ? "Modification…"
                : "Modifier le mot de passe"
            }
            onPress={() => void handleSave()}
          />
        </ScreenScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

function createStyles(themeColors: ThemeColors) {
  return StyleSheet.create({
    keyboardView: { flex: 1 },
    content: { gap: spacing.lg },
    intro: { gap: spacing.xxs },
    title: {
      color: themeColors.neutral.textPrimary,
      fontSize: typography.size.h1,
      lineHeight: typography.lineHeight.h1,
      fontWeight: typography.weight.bold,
    },
    subtitle: {
      color: themeColors.neutral.textSecondary,
      fontSize: typography.size.body,
      lineHeight: typography.lineHeight.body,
    },
    form: { gap: spacing.md },
    fieldGroup: { gap: spacing.xxs },
    label: {
      color: themeColors.neutral.textPrimary,
      fontSize: typography.size.label,
      fontWeight: typography.weight.medium,
    },
    input: {
      minHeight: 52,
      borderWidth: 1,
      borderColor: themeColors.neutral.border,
      borderRadius: radius.md,
      backgroundColor: themeColors.neutral.white,
      paddingHorizontal: spacing.sm,
      color: themeColors.neutral.textPrimary,
      fontSize: typography.size.body,
    },
    helpText: {
      color: themeColors.neutral.textSecondary,
      fontSize: typography.size.caption,
      lineHeight: typography.lineHeight.caption,
    },
    error: {
      color: themeColors.semantic.error,
      fontSize: typography.size.caption,
      lineHeight: typography.lineHeight.caption,
      fontWeight: typography.weight.medium,
    },
  });
}
