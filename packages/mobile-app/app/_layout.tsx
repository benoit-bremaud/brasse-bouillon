import "react-native-reanimated";

import { AuthProvider, useAuth } from "@/core/auth/auth-context";
import { AccountPreferencesProvider } from "@/core/preferences/account-preferences-context";
import { ThemeProvider, useTheme } from "@/core/theme";
import { getAccountPreferences } from "@/features/profile/application/account-preferences.use-cases";

import { ConfirmProvider } from "@/core/ui/confirm-provider";
import { SnackbarProvider } from "@/core/ui/snackbar-provider";
import { StickyCtaClearanceProvider } from "@/core/ui/sticky-cta-clearance";
import { QueryProvider } from "@/core/query/query-provider";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

async function loadInitialAccountPreferences() {
  const preferences = await getAccountPreferences();
  return { theme: preferences.theme, units: preferences.units };
}

function AppShell() {
  const { session } = useAuth();
  const { resolvedMode } = useTheme();
  const queryScopeKey = session?.accessToken ?? "anonymous";

  return (
    <QueryProvider key={queryScopeKey}>
      <ConfirmProvider>
        <StickyCtaClearanceProvider>
          <SnackbarProvider>
            <Stack screenOptions={{ headerShown: false }} />
            <StatusBar style={resolvedMode === "dark" ? "light" : "dark"} />
          </SnackbarProvider>
        </StickyCtaClearanceProvider>
      </ConfirmProvider>
    </QueryProvider>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <AccountPreferencesProvider
          loadInitialPreferences={loadInitialAccountPreferences}
        >
          <ThemeProvider>
            <AppShell />
          </ThemeProvider>
        </AccountPreferencesProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
