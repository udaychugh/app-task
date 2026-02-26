import api from "@/lib/api";

// Auth
export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    user: {
      id: string;
      name: string;
      email: string;
      city: string | null;
      role: string;
      createdAt: string;
      lastLoginAt: string;
      token: string;
      refresh_token: string;
    };
    session: {
      id: string;
      userId: string;
      loginTime: string;
      logoutTime: string | null;
      durationSeconds: number | null;
      createdAt: string;
    };
  };
}

export const authApi = {
  login: (email: string, password: string) =>
    api.post<LoginResponse>("/api/auth/login", { email, password }),
};

// Generic wrapper — all API responses follow this shape
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// Users
export interface AdminUser {
  id: string;
  name: string;
  email: string;
  city: string;
  lastLoginAt: string;
}

export const usersApi = {
  getAll: async () => {
    const res = await api.get<ApiResponse<{ users: AdminUser[] }>>("/api/admin/users");
    return res;
  },
};

// Search Logs
export interface SearchLog {
  id: string;
  userEmail: string;
  userName?: string;
  city: string;
  timestamp: string;
}

export const searchesApi = {
  getAll: async () => {
    const res = await api.get<ApiResponse<{ searches: SearchLog[] }>>("/api/admin/searches");
    return res;
  },
};

// Sessions
export interface Session {
  id: string;
  userEmail: string;
  userName?: string; // Adding userName based on backend response
  loginTime: string;
  logoutTime: string | null;
  duration: number | null;
}

export const sessionsApi = {
  getAll: async () => {
    const res = await api.get<ApiResponse<{ sessions: Session[] }>>("/api/admin/sessions");
    return res;
  },
};

