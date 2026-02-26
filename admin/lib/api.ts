import axios, { InternalAxiosRequestConfig } from "axios";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000";
const IS_DEV = __DEV__;

// Extend config to carry request start time
interface TimedRequestConfig extends InternalAxiosRequestConfig {
  _startTime?: number;
}

// Web-safe token helpers (SecureStore is native-only)
export const TokenStorage = {
  async get(): Promise<string | null> {
    if (Platform.OS === "web") {
      return localStorage.getItem("admin_token");
    }
    return SecureStore.getItemAsync("admin_token");
  },
  async set(token: string): Promise<void> {
    if (Platform.OS === "web") {
      localStorage.setItem("admin_token", token);
      return;
    }
    await SecureStore.setItemAsync("admin_token", token);
  },
  async remove(): Promise<void> {
    if (Platform.OS === "web") {
      localStorage.removeItem("admin_token");
      return;
    }
    await SecureStore.deleteItemAsync("admin_token");
  },
};

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

// ─── Request Interceptor — attach token & log ────────────────────────
api.interceptors.request.use(
  async (config: TimedRequestConfig) => {
    // Attach auth token
    const token = await TokenStorage.get();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Stamp start time for duration measurement
    config._startTime = Date.now();

    // Log outgoing request
    if (IS_DEV) {
      const method = (config.method ?? "GET").toUpperCase();
      const url = `${config.baseURL ?? ""}${config.url ?? ""}`;
      console.groupCollapsed(`🚀 [API Request] ${method} ${url}`);
      console.log("🕐 Time   :", new Date().toLocaleTimeString());
      if (config.params && Object.keys(config.params).length) {
        console.log("📎 Params :", config.params);
      }
      if (config.data) {
        console.log("📦 Body   :", config.data);
      }
      console.log("🔑 Auth   :", token ? "Bearer ***" : "None");
      console.groupEnd();
    }

    return config;
  },
  (error) => {
    if (IS_DEV) {
      console.groupCollapsed("❌ [API Request Error]");
      console.error("Message:", error.message);
      console.groupEnd();
    }
    return Promise.reject(error);
  },
);

// ─── Response Interceptor — log & handle 401 ─────────────────────────
api.interceptors.response.use(
  (response) => {
    if (IS_DEV) {
      const config = response.config as TimedRequestConfig;
      const method = (config.method ?? "GET").toUpperCase();
      const url = `${config.baseURL ?? ""}${config.url ?? ""}`;
      const duration = config._startTime
        ? `${Date.now() - config._startTime}ms`
        : "N/A";

      console.groupCollapsed(
        `✅ [API Response] ${response.status} ${method} ${url} (${duration})`,
      );
      console.log("📥 Data   :", response.data);
      console.groupEnd();
    }
    return response;
  },
  async (error) => {
    if (IS_DEV) {
      const config = (error.config ?? {}) as TimedRequestConfig;
      const method = (config.method ?? "GET").toUpperCase();
      const url = `${config.baseURL ?? ""}${config.url ?? ""}`;
      const status = error.response?.status ?? "NO_RESPONSE";
      const duration = config._startTime
        ? `${Date.now() - config._startTime}ms`
        : "N/A";

      console.groupCollapsed(
        `🔴 [API Error] ${status} ${method} ${url} (${duration})`,
      );
      console.error("Message :", error.message);
      if (error.response?.data) {
        console.error("Response:", error.response.data);
      }
      console.groupEnd();
    }

    // Handle unauthorized — clear token & redirect to login
    if (error.response?.status === 401) {
      await TokenStorage.remove();
      // router.replace("/login");
    }
    return Promise.reject(error);
  },
);

export default api;
