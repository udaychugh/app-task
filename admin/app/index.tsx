import { useAuthStore } from "@/store/authStore";
import { Redirect } from "expo-router";

/**
 * Root index — redirect based on auth state.
 * isInitialized waits for the store to read the stored token before deciding.
 */
export default function Index() {
  const { token, isInitialized } = useAuthStore();

  if (!isInitialized) return null;

  if (token) {
    return <Redirect href="/(admin)/users" />;
  }

  return <Redirect href="/login" />;
}
