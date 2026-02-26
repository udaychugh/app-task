import apiClient from "../api/axiosInstance";

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
}

export interface LoginApiResponse {
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

export interface AuthResult {
  token: string;
  sessionId: string;
}

export const registerUser = async (
  payload: RegisterPayload,
): Promise<RegisterResponse> => {
  const response = await apiClient.post<RegisterResponse>(
    "/api/auth/register",
    payload,
  );
  console.log(response.data);
  return response.data;
};

export const loginUser = async (payload: LoginPayload): Promise<AuthResult> => {
  const response = await apiClient.post<LoginApiResponse>(
    "/api/auth/login",
    payload,
  );
  const { user, session } = response.data.data;
  return {
    token: user.token,
    sessionId: session.id,
  };
};
