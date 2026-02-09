import { Redirect, Stack } from "expo-router";

import { useAuth } from "@/core/auth/auth-context";

export default function AuthLayout() {
  const { session } = useAuth();

  if (session) {
    return <Redirect href="/(app)/recipes" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
