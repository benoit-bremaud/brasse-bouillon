import "react-native-reanimated";

import { AuthProvider, useAuth } from "@/core/auth/auth-context";

import { QueryProvider } from "@/core/query/query-provider";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

function AppShell() {
  const { session } = useAuth();
  const queryScopeKey = session?.accessToken ?? "anonymous";

  return (
    <QueryProvider key={queryScopeKey}>
      <Stack screenOptions={{ headerShown: false }} />
      <StatusBar style="auto" />
    </QueryProvider>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <AppShell />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
