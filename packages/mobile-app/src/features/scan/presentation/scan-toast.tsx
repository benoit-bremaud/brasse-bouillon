import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors, radius, spacing, typography } from "@/core/theme";

type ScanToastVariant = "info" | "success";

type ScanToastState = {
  message: string;
  variant: ScanToastVariant;
} | null;

type ScanToastContextValue = {
  showToast: (message: string, variant?: ScanToastVariant) => void;
};

const TOAST_DURATION_MS = 2800;

const ScanToastContext = createContext<ScanToastContextValue | null>(null);

export function ScanToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<ScanToastState>(null);

  const showToast = useCallback(
    (message: string, variant: ScanToastVariant = "info") => {
      setToast({ message, variant });
      setTimeout(() => {
        setToast((currentToast) =>
          currentToast?.message === message ? null : currentToast,
        );
      }, TOAST_DURATION_MS);
    },
    [],
  );

  const contextValue = useMemo(
    () => ({
      showToast,
    }),
    [showToast],
  );

  return (
    <ScanToastContext.Provider value={contextValue}>
      {children}
      {toast ? (
        <View pointerEvents="none" style={styles.toastLayer}>
          <View
            style={[
              styles.toast,
              toast.variant === "success"
                ? styles.toastSuccess
                : styles.toastInfo,
            ]}
          >
            <Text style={styles.toastText}>{toast.message}</Text>
          </View>
        </View>
      ) : null}
    </ScanToastContext.Provider>
  );
}

export function useScanToast(): ScanToastContextValue {
  const context = useContext(ScanToastContext);
  if (!context) {
    return {
      showToast: () => {
        // no-op outside provider
      },
    };
  }

  return context;
}

const styles = StyleSheet.create({
  toastLayer: {
    position: "absolute",
    left: spacing.md,
    right: spacing.md,
    bottom: spacing.xl,
    alignItems: "center",
  },
  toast: {
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    width: "100%",
  },
  toastInfo: {
    backgroundColor: colors.neutral.textPrimary,
  },
  toastSuccess: {
    backgroundColor: colors.semantic.success,
  },
  toastText: {
    color: colors.neutral.white,
    fontSize: typography.size.label,
    lineHeight: typography.lineHeight.label,
    fontWeight: typography.weight.medium,
    textAlign: "center",
  },
});
