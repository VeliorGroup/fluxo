"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { useRouter, usePathname } from "next/navigation";

type AuthContextType = {
  isAuthenticated: boolean;
  username: string | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const VALID_USERNAME = "devisgjyzeli";
const VALID_PASSWORD = "admin";
const STORAGE_KEY = "fluxo_auth";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Restore session from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.authenticated && parsed.username) {
          setIsAuthenticated(true);
          setUsername(parsed.username);
        }
      } catch {
        // invalid stored data
      }
    }
    setHydrated(true);
  }, []);

  // Redirect logic
  useEffect(() => {
    if (!hydrated) return;
    if (!isAuthenticated && pathname !== "/") {
      router.replace("/");
    }
    if (isAuthenticated && pathname === "/") {
      router.replace("/dashboard");
    }
  }, [hydrated, isAuthenticated, pathname, router]);

  const login = useCallback((user: string, pass: string): boolean => {
    if (user === VALID_USERNAME && pass === VALID_PASSWORD) {
      setIsAuthenticated(true);
      setUsername(user);
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ authenticated: true, username: user })
      );
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    setIsAuthenticated(false);
    setUsername(null);
    localStorage.removeItem(STORAGE_KEY);
    router.replace("/");
  }, [router]);

  // Don't render until hydrated to avoid flash
  if (!hydrated) {
    return null;
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, username, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
