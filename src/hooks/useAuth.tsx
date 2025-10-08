import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User } from "@/interface/user";
import { useRouter } from "next/router";

type AuthContextType = {
  user: User | null;
  isAuthLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (formData: { name: string; email: string; password: string; confirmPassword: string }) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const saved = localStorage.getItem("user");
    if (saved) {
      try {
        const userData = JSON.parse(saved);
        setUser(userData);
        verifyUser(userData.email);
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem("user");
      }
    }
    setIsAuthLoading(false);
  }, []);

  const verifyUser = async (email: string) => {
    try {
      const response = await fetch(`/api/auth/me`);
      if (!response.ok) {
        localStorage.removeItem("user");
        setUser(null);
      }
    } catch (error) {
      console.error('Error verifying user:', error);
    }
  };

  const login = async (email: string, password: string) => {
    setIsAuthLoading(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Đăng nhập thất bại");
      }

      const userData = {
        _id: data.user._id,
        email: data.user.email,
        name: data.user.name,
        createdAt: data.user.createdAt,
      };

      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
    } catch (error) {
      throw new Error((error as Error).message || "Đăng nhập thất bại");
    } finally {
      setIsAuthLoading(false);
    }
  };

  const register = async (formData: { name: string; email: string; password: string; confirmPassword: string }) => {
    setIsAuthLoading(true);
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Đăng ký thất bại");
      }

      const userData = {
        _id: data.user._id,
        email: data.user.email,
        name: data.user.name,
        createdAt: data.user.createdAt,
      };

      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
    } catch (error) {
      throw new Error((error as Error).message || "Đăng ký thất bại");
    } finally {
      setIsAuthLoading(false);
    }
  };

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    
    localStorage.removeItem("user");
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, isAuthLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};