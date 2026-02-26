import * as SecureStore from "expo-secure-store";
import React, {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

interface AuthContextType {
  token: string | null;
  sessionId: string | null;
  isLoading: boolean;
  saveSession: (token: string, sessionId: string) => Promise<void>;
  clearSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadSession = async () => {
      const storedToken = await SecureStore.getItemAsync("authToken");
      const storedSession = await SecureStore.getItemAsync("sessionId");
      if (storedToken) setToken(storedToken);
      if (storedSession) setSessionId(storedSession);
      setIsLoading(false);
    };
    loadSession();
  }, []);

  const saveSession = async (newToken: string, newSessionId: string) => {
    await SecureStore.setItemAsync("authToken", newToken);
    await SecureStore.setItemAsync("sessionId", newSessionId);
    setToken(newToken);
    setSessionId(newSessionId);
  };

  const clearSession = async () => {
    await SecureStore.deleteItemAsync("authToken");
    await SecureStore.deleteItemAsync("sessionId");
    await SecureStore.deleteItemAsync("userCity");
    setToken(null);
    setSessionId(null);
  };

  return (
    <AuthContext.Provider
      value={{ token, sessionId, isLoading, saveSession, clearSession }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
