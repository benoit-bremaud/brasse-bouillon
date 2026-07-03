import "react-native-reanimated";

import { AuthProvider, useAuth } from "@/core/auth/auth-context";

import { ConfirmProvider } from "@/core/ui/confirm-provider";
import { QueryProvider } from "@/core/query/query-provider";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

function AppShell() {
  const { session } = useAuth();
  const queryScopeKey = session?.accessToken ?? "anonymous";

  return (
    <QueryProvider key={queryScopeKey}>
      <ConfirmProvider>
        <Stack screenOptions={{ headerShown: false }} />
        <StatusBar style="auto" />
      </ConfirmProvider>
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
