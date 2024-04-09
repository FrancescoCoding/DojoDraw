import { createContext, useState, useEffect, ReactNode } from "react";
import { loginUser, logoutUser } from "@/services/authService";
import axiosInstance from "@/lib/AxiosConfig";

type User = {
  id: string;
  name: string;
  email: string;
  isRaffleHolder: boolean;
};

type AuthContextType = {
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  user: User | null;
};

export const AuthContext = createContext<AuthContextType>(null!);

// Provider component
const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const verifyUserSession = async () => {
      try {
        const { data } = await axiosInstance.get("/auth/verify-session", {
          withCredentials: true,
        });
        if (data.isAuthenticated) {
          // Set the user and isAuthenticated state from the response
          setIsAuthenticated(true);
          setUser(data.user);
        } else {
          // If not authenticated, set isAuthenticated to false and user to null
          setIsAuthenticated(false);
          setUser(null);
        }
      } catch (error) {
        setIsAuthenticated(false);
        setUser(null);
        console.error("Error verifying session:", error);
      }
    };

    verifyUserSession();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await loginUser(email, password);
      setIsAuthenticated(true);
      setUser(response);
    } catch (error) {
      console.error("Login error:", error);

      setIsAuthenticated(false);
      setUser(null);
    }
  };

  const logout = async () => {
    await logoutUser();
    setIsAuthenticated(false);
    setUser(null);
  };

  const value = { isAuthenticated, login, logout, user };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
