import { TokenStorage } from "@/lib/api";
import { authApi } from "@/lib/services";
import { create } from "zustand";

interface AdminInfo {
  name: string;
  email: string;
}

interface AuthState {
  token: string | null;
  admin: AdminInfo | null;
  isLoading: boolean;
  isInitialized: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token: null,
  admin: null,
  isLoading: false,
  isInitialized: false,

  initialize: async () => {
    const token = await TokenStorage.get();
    // Preserve admin if already set (e.g. from a fresh login in this session)
    const current = get();
    set({
      token,
      admin: current.admin ?? null,
      isInitialized: true,
    });
  },

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const { data } = await authApi.login(email, password);
      console.log("[AuthStore] Raw login response:", JSON.stringify(data, null, 2));

      const { user } = data.data;
      await TokenStorage.set(user.token);
      set({
        token: user.token,
        admin: { name: user.name, email: user.email },
        isLoading: false,
        isInitialized: true,
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    await TokenStorage.remove();
    set({ token: null, admin: null });
  },
}));
