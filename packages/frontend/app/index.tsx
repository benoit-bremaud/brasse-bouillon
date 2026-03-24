import { useAuth } from "@/core/auth/auth-context";
import { Redirect } from "expo-router";

export default function Index() {
  const { session } = useAuth();

  return <Redirect href={session ? "/(app)/dashboard" : "/(auth)/login"} />;
}
