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

type FieldProps = {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  accessibilityLabel: string;
  keyboardType?: "default" | "email-address";
  autoCapitalize?: "none" | "sentences";
  autoComplete?: "email" | "name" | "off" | "username";
};

function Field({
  label,
  value,
  onChangeText,
  accessibilityLabel,
  keyboardType = "default",
  autoCapitalize = "sentences",
  autoComplete = "off",
}: FieldProps) {
  const { colors: themeColors } = useTheme();
  const styles = useMemo(() => createStyles(themeColors), [themeColors]);

  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        accessibilityLabel={accessibilityLabel}
        autoCapitalize={autoCapitalize}
        autoComplete={autoComplete}
        keyboardType={keyboardType}
        onChangeText={onChangeText}
        style={styles.input}
        value={value}
      />
    </View>
  );
}

export function EditProfileScreen() {
  const router = useRouter();
  const { session, updateProfile, isLoading } = useAuth();
  const { colors: themeColors } = useTheme();
  const styles = useMemo(() => createStyles(themeColors), [themeColors]);
  const [firstName, setFirstName] = useState(session?.user.firstName ?? "");
  const [lastName, setLastName] = useState(session?.user.lastName ?? "");
  const [bio, setBio] = useState(session?.user.bio ?? "");
  const [username, setUsername] = useState(session?.user.username ?? "");
  const [email, setEmail] = useState(session?.user.email ?? "");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (isSaving) {
      return;
    }

    setErrorMessage(null);
    const trimmedEmail = email.trim();
    const trimmedUsername = username.trim();

    if (!trimmedEmail || !trimmedEmail.includes("@")) {
      setErrorMessage("Saisis une adresse e-mail valide.");
      return;
    }
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(trimmedUsername)) {
      setErrorMessage(
        "L'identifiant doit contenir entre 3 et 20 caractères alphanumériques ou tirets bas.",
      );
      return;
    }

    setIsSaving(true);
    try {
      await updateProfile({
        email: trimmedEmail,
        username: trimmedUsername,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        bio: bio.trim(),
      });
      router.back();
    } catch (error) {
      setErrorMessage(
        getErrorMessage(error, "Impossible d'enregistrer tes informations."),
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
            <Text style={styles.title}>Informations personnelles</Text>
            <Text style={styles.subtitle}>
              Ces informations servent à personnaliser ton expérience.
            </Text>
          </View>
          <View style={styles.form}>
            <Field
              accessibilityLabel="Prénom"
              autoComplete="name"
              label="Prénom"
              onChangeText={setFirstName}
              value={firstName}
            />
            <Field
              accessibilityLabel="Nom"
              autoComplete="name"
              label="Nom"
              onChangeText={setLastName}
              value={lastName}
            />
            <Field
              accessibilityLabel="Identifiant"
              autoCapitalize="none"
              autoComplete="username"
              label="Identifiant"
              onChangeText={setUsername}
              value={username}
            />
            <Field
              accessibilityLabel="Adresse e-mail"
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              label="Adresse e-mail"
              onChangeText={setEmail}
              value={email}
            />
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Bio</Text>
              <TextInput
                accessibilityLabel="Bio"
                autoCapitalize="sentences"
                maxLength={500}
                multiline
                onChangeText={setBio}
                placeholder="Présente-toi en quelques mots"
                style={[styles.input, styles.bioInput]}
                value={bio}
              />
              <Text style={styles.counter}>{bio.length}/500</Text>
            </View>
          </View>
          {errorMessage ? (
            <Text style={styles.error}>{errorMessage}</Text>
          ) : null}
          <PrimaryButton
            accessibilityLabel="Enregistrer mes informations"
            disabled={isLoading || isSaving}
            label={isLoading || isSaving ? "Enregistrement…" : "Enregistrer"}
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
    bioInput: {
      minHeight: 112,
      textAlignVertical: "top",
      paddingTop: spacing.sm,
    },
    counter: {
      alignSelf: "flex-end",
      color: themeColors.neutral.textSecondary,
      fontSize: typography.size.caption,
    },
    error: {
      color: themeColors.semantic.error,
      fontSize: typography.size.caption,
      lineHeight: typography.lineHeight.caption,
      fontWeight: typography.weight.medium,
    },
  });
}
