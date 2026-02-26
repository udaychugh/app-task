import axios from "axios";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://192.168.1.6:3000";

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

// ─── Request Interceptor ───
apiClient.interceptors.request.use(
  async (config) => {
    // 1. Log Request
    const fullUrl = `${config.baseURL}${config.url}`;
    console.log(`🚀 [API Request] ${config.method?.toUpperCase()} ${fullUrl}`);
    if (config.params) console.log("📦 [Query Params]:", config.params);
    if (config.data) console.log("📦 [Body]:", config.data);

    // 2. Attach Token
    const token = await SecureStore.getItemAsync("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error("❌ [API Request Error]:", error);
    return Promise.reject(error);
  },
);

// ─── Response Interceptor ───
apiClient.interceptors.response.use(
  (response) => {
    console.log(`✅ [API Response] ${response.status} ${response.config.url}`);
    if (response.data) console.log("📂 [Response Data]:", response.data);
    return response;
  },
  async (error) => {
    const status = error.response?.status || "NETWORK_ERROR";
    const url = error.config?.url || "UNKNOWN_URL";

    console.error(`❌ [API Error] ${status} ${url}`);
    if (error.response?.data) {
      console.error("📂 [Error Data]:", error.response.data);
    } else {
      console.error("📝 [Error Message]:", error.message);
    }

    // Auto-logout on 401
    if (error.response?.status === 401) {
      await SecureStore.deleteItemAsync("authToken");
      await SecureStore.deleteItemAsync("sessionId");
      await SecureStore.deleteItemAsync("userCity");
      router.replace("/auth");
    }
    return Promise.reject(error);
  },
);

export default apiClient;
