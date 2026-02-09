import { Redirect } from "expo-router";

import { useAuth } from "@/core/auth/auth-context";

export default function Index() {
  const { session } = useAuth();

  return <Redirect href={session ? "/(app)/recipes" : "/(auth)/login"} />;
}
