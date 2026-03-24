import { colors, spacing, typography } from "@/core/theme";
import { Link, Stack } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Oops!" }} />
      <View style={styles.container}>
        <Text style={styles.title}>This screen doesn't exist.</Text>

        <Link href="/" style={styles.link}>
          <Text style={styles.linkText}>Go to home screen!</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.md,
  },
  title: {
    fontSize: typography.size.h2,
    fontWeight: typography.weight.bold,
  },
  link: {
    marginTop: spacing.sm,
    paddingVertical: spacing.sm,
  },
  linkText: {
    fontSize: typography.size.label,
    color: colors.brand.secondary,
  },
});
