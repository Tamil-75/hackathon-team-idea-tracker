import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import apiClient from "../api/client";
import type { User } from "../types";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
}

interface RegisterData {
  name: string;
  register_number: string;
  email: string;
  password: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("hackathon_token")
  );
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem("hackathon_token");
      const storedUser = localStorage.getItem("hackathon_user");

      if (storedToken && storedUser) {
        try {
          // Verify token is still valid
          const response = await apiClient.get("/auth/me");
          setUser(response.data);
          setToken(storedToken);
        } catch {
          // Token invalid, clear storage
          localStorage.removeItem("hackathon_token");
          localStorage.removeItem("hackathon_user");
          setUser(null);
          setToken(null);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const response = await apiClient.post("/auth/login", { email, password });
    const { access_token } = response.data;

    localStorage.setItem("hackathon_token", access_token);
    setToken(access_token);

    // Fetch user profile
    const userResponse = await apiClient.get("/auth/me");
    localStorage.setItem("hackathon_user", JSON.stringify(userResponse.data));
    setUser(userResponse.data);

    // Return user for role-aware redirect
    return userResponse.data as User;
  }, []);

  const register = useCallback(async (data: RegisterData) => {
    await apiClient.post("/auth/register", data);
    // Auto-login after registration
    await login(data.email, data.password);
  }, [login]);

  const logout = useCallback(() => {
    localStorage.removeItem("hackathon_token");
    localStorage.removeItem("hackathon_user");
    setUser(null);
    setToken(null);
  }, []);

  const isAuthenticated = !!token && !!user;
  const isAdmin = user?.role === "admin";

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        isAdmin,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
