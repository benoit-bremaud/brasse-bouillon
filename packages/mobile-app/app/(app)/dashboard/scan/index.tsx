import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "@/core/theme/colors";
import { radius } from "@/core/theme/radius";
import { spacing } from "@/core/theme/spacing";
import { typography } from "@/core/theme/typography";
import { ScanScreen } from "@/features/scan/presentation/ScanScreen";

export default function DashboardScanRoute() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <ScanScreen />
      {__DEV__ ? (
        <Pressable
          accessibilityLabel="Open benchmark screen (dev only)"
          accessibilityRole="button"
          onPress={() => {
            router.push("/(app)/dashboard/scan/benchmark");
          }}
          style={styles.devButton}
        >
          <Text style={styles.devButtonText}>🧪 Benchmark</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  devButton: {
    position: "absolute",
    bottom: spacing.xxl,
    right: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: colors.brand.secondary,
    elevation: 4,
    shadowColor: colors.neutral.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    zIndex: 999,
  },
  devButtonText: {
    fontSize: typography.size.label,
    lineHeight: typography.lineHeight.label,
    fontWeight: typography.weight.medium,
    color: colors.neutral.white,
  },
});
