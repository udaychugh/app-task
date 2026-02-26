import { useAuthStore } from "@/store/authStore";
import { useRouter, useRootNavigationState, useSegments } from "expo-router";
import { useEffect } from "react";

/**
 * Auth guard hook — redirects to /login if not authenticated,
 * and away from /login if already authenticated.
 * Waits for both the auth store AND the router to be fully ready
 * before making any navigation decisions.
 */
export function useAuthGuard() {
  const { token, isInitialized } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();
  const rootNavState = useRootNavigationState();

  useEffect(() => {
    // Don't act until store is initialized AND router is ready
    if (!isInitialized) return;
    if (!rootNavState?.key) return;

    const inAdminGroup = segments[0] === "(admin)";
    const onLogin = segments[0] === "login";

    if (__DEV__) {
      console.log("[AuthGuard]", {
        token: token ? "***" : null,
        isInitialized,
        segments,
        inAdminGroup,
        onLogin,
      });
    }

    if (!token && inAdminGroup) {
      router.replace("/login");
    } else if (token && onLogin) {
      router.replace("/(admin)/users");
    }
  }, [token, isInitialized, segments, router, rootNavState?.key]);
}

