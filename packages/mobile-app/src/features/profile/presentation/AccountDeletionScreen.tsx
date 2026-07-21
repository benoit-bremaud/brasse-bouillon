import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { useAuth } from "@/core/auth/auth-context";
import { getErrorMessage } from "@/core/http/http-error";
import { radius, spacing, typography, useTheme } from "@/core/theme";
import type { ThemeColors } from "@/core/theme";
import { Card } from "@/core/ui/Card";
import { HeaderBackButton } from "@/core/ui/HeaderBackButton";
import { PrimaryButton } from "@/core/ui/PrimaryButton";
import { Screen } from "@/core/ui/Screen";
import { ScreenScrollView } from "@/core/ui/ScreenScrollView";

export function AccountDeletionScreen() {
  const router = useRouter();
  const { session, requestAccountDeletion, cancelAccountDeletion, isLoading } =
    useAuth();
  const { colors: themeColors } = useTheme();
  const styles = useMemo(() => createStyles(themeColors), [themeColors]);
  const [confirmation, setConfirmation] = useState("");
  const [isConfirmVisible, setIsConfirmVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const username = session?.user.username ?? "";
  const scheduledFor = session?.user.deletionScheduledFor ?? null;
  const hasPendingDeletion = Boolean(scheduledFor);
  const isConfirmationValid = confirmation === username && username.length > 0;

  const handleRequestDeletion = async () => {
    if (!isConfirmationValid || isLoading) {
      return;
    }

    setErrorMessage(null);
    try {
      await requestAccountDeletion();
      setIsConfirmVisible(false);
    } catch (error) {
      setIsConfirmVisible(false);
      setErrorMessage(
        getErrorMessage(error, "Impossible de supprimer le compte."),
      );
    }
  };

  const handleCancelDeletion = async () => {
    if (isLoading) {
      return;
    }

    setErrorMessage(null);
    try {
      await cancelAccountDeletion();
    } catch (error) {
      setErrorMessage(
        getErrorMessage(error, "Impossible d'annuler la suppression."),
      );
    }
  };

  return (
    <Screen>
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
          <Text style={styles.eyebrow}>DONNÉES PERSONNELLES</Text>
          <Text style={styles.title}>Supprimer mon compte</Text>
          <Text style={styles.subtitle}>
            Cette action programme l'effacement de tes informations privées et
            de tes données locales. Les recettes rendues publiques sont
            conservées et anonymisées.
          </Text>
        </View>

        {hasPendingDeletion ? (
          <Card style={styles.pendingCard}>
            <Text style={styles.pendingTitle}>Suppression programmée</Text>
            <Text style={styles.pendingText}>
              Ton compte sera supprimé le {formatDeletionDate(scheduledFor)}. Tu
              peux encore annuler cette demande avant cette date.
            </Text>
            <PrimaryButton
              accessibilityLabel="Annuler la suppression programmée"
              disabled={isLoading}
              label={isLoading ? "Annulation…" : "Annuler la suppression"}
              onPress={() => void handleCancelDeletion()}
            />
          </Card>
        ) : (
          <Card style={styles.warningCard}>
            <Text style={styles.warningTitle}>
              Délai de récupération : 30 jours
            </Text>
            <Text style={styles.warningText}>
              Tu peux annuler la demande pendant ce délai. Passé cette date,
              l'effacement sera exécuté de manière définitive.
            </Text>
          </Card>
        )}

        {!hasPendingDeletion ? (
          <View style={styles.form}>
            <Text style={styles.label}>
              Saisis ton identifiant pour continuer : {username}
            </Text>
            <TextInput
              accessibilityLabel="Confirmation de suppression"
              autoCapitalize="none"
              onChangeText={setConfirmation}
              placeholder={username}
              style={styles.input}
              value={confirmation}
            />
            {errorMessage ? (
              <Text style={styles.error}>{errorMessage}</Text>
            ) : null}
            <PrimaryButton
              accessibilityLabel="Préparer la suppression du compte"
              disabled={!isConfirmationValid || isLoading}
              label={isLoading ? "Préparation…" : "Programmer la suppression"}
              onPress={() => setIsConfirmVisible(true)}
            />
          </View>
        ) : errorMessage ? (
          <Text style={styles.error}>{errorMessage}</Text>
        ) : null}
      </ScreenScrollView>

      <Modal
        transparent
        animationType="fade"
        visible={isConfirmVisible}
        onRequestClose={() => setIsConfirmVisible(false)}
      >
        <View style={styles.modalRoot}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Fermer la confirmation de suppression"
            onPress={() => setIsConfirmVisible(false)}
            style={styles.modalOverlay}
          />
          <Card style={styles.modalCard}>
            <Text style={styles.modalTitle}>Confirmer la suppression</Text>
            <Text style={styles.modalText}>
              Programmer la suppression du compte @{username} ?
            </Text>
            <View style={styles.actions}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Annuler la suppression"
                onPress={() => setIsConfirmVisible(false)}
                style={styles.cancelButton}
              >
                <Text style={styles.cancelText}>Annuler</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Confirmer la programmation de suppression"
                onPress={() => void handleRequestDeletion()}
                style={styles.deleteButton}
              >
                <Text style={styles.deleteText}>Programmer</Text>
              </Pressable>
            </View>
          </Card>
        </View>
      </Modal>
    </Screen>
  );
}

function createStyles(themeColors: ThemeColors) {
  return StyleSheet.create({
    content: { gap: spacing.lg },
    intro: { gap: spacing.xxs },
    eyebrow: {
      color: themeColors.semantic.error,
      fontSize: typography.size.caption,
      fontWeight: typography.weight.bold,
      letterSpacing: 1,
    },
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
    warningCard: {
      gap: spacing.xs,
      borderColor: themeColors.semantic.error,
      backgroundColor: themeColors.state.errorBackground,
    },
    pendingCard: {
      gap: spacing.xs,
      borderColor: themeColors.brand.secondary,
      backgroundColor: themeColors.neutral.white,
    },
    pendingTitle: {
      color: themeColors.brand.secondary,
      fontSize: typography.size.label,
      fontWeight: typography.weight.bold,
    },
    pendingText: {
      color: themeColors.neutral.textPrimary,
      fontSize: typography.size.body,
      lineHeight: typography.lineHeight.body,
    },
    warningTitle: {
      color: themeColors.semantic.error,
      fontSize: typography.size.label,
      fontWeight: typography.weight.bold,
    },
    warningText: {
      color: themeColors.neutral.textPrimary,
      fontSize: typography.size.caption,
      lineHeight: typography.lineHeight.caption,
    },
    form: { gap: spacing.sm },
    label: {
      color: themeColors.neutral.textPrimary,
      fontSize: typography.size.label,
      lineHeight: typography.lineHeight.label,
      fontWeight: typography.weight.medium,
    },
    input: {
      minHeight: 50,
      paddingHorizontal: spacing.sm,
      borderWidth: 1,
      borderColor: themeColors.neutral.border,
      borderRadius: radius.md,
      backgroundColor: themeColors.neutral.white,
      color: themeColors.neutral.textPrimary,
      fontSize: typography.size.body,
    },
    error: {
      color: themeColors.semantic.error,
      fontSize: typography.size.caption,
      lineHeight: typography.lineHeight.caption,
      fontWeight: typography.weight.medium,
    },
    modalRoot: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: spacing.md,
    },
    modalOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: themeColors.neutral.black + "55",
    },
    modalCard: { width: "100%", maxWidth: 420, gap: spacing.sm },
    modalTitle: {
      color: themeColors.neutral.textPrimary,
      fontSize: typography.size.body,
      fontWeight: typography.weight.bold,
    },
    modalText: {
      color: themeColors.neutral.textSecondary,
      fontSize: typography.size.label,
      lineHeight: typography.lineHeight.label,
    },
    actions: { flexDirection: "row", gap: spacing.xs },
    cancelButton: {
      flex: 1,
      minHeight: 48,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: themeColors.neutral.border,
      borderRadius: radius.md,
    },
    deleteButton: {
      flex: 1,
      minHeight: 48,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: themeColors.semantic.error,
      borderRadius: radius.md,
      backgroundColor: themeColors.state.errorBackground,
    },
    cancelText: {
      color: themeColors.neutral.textPrimary,
      fontSize: typography.size.label,
      fontWeight: typography.weight.medium,
    },
    deleteText: {
      color: themeColors.semantic.error,
      fontSize: typography.size.label,
      fontWeight: typography.weight.bold,
    },
  });
}

function formatDeletionDate(value: string | null): string {
  if (!value) {
    return "date inconnue";
  }

  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "long",
    timeZone: "UTC",
  }).format(new Date(value));
}
