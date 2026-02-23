import { colors } from "@/core/theme";
import { Stack } from "expo-router";

export default function AcademyLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: colors.neutral.white,
        },
        headerTintColor: colors.neutral.textPrimary,
        headerTitleStyle: {
          fontWeight: "bold",
        },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: "Académie",
          headerShown: false,
        }}
      />
    </Stack>
  );
}
