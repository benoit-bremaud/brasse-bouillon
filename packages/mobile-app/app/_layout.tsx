import "react-native-reanimated";

import { AuthProvider, useAuth } from "@/core/auth/auth-context";

import { ConfirmProvider } from "@/core/ui/confirm-provider";
import { FooterVisibilityProvider } from "@/core/ui/footer-visibility-context";
import { SnackbarProvider } from "@/core/ui/snackbar-provider";
import { StickyCtaClearanceProvider } from "@/core/ui/sticky-cta-clearance";
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
        {/*
          Above the Snackbar on purpose: the Snackbar is mounted here at the
          root, outside `(app)/_layout`, so a provider scoped to the tab layout
          would leave it reading the default `visible: true` and never
          following the bar — silently breaking ADR-0029 clause 5.
        */}
        <FooterVisibilityProvider>
          <StickyCtaClearanceProvider>
            <SnackbarProvider>
              <Stack screenOptions={{ headerShown: false }} />
              <StatusBar style="auto" />
            </SnackbarProvider>
          </StickyCtaClearanceProvider>
        </FooterVisibilityProvider>
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
