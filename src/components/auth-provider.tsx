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
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

type AuthContextType = {
  isAuthenticated: boolean;
  username: string | null;
  user: User | null;
  login: (username: string, password: string) => Promise<string | null>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Map usernames to their Supabase emails
function usernameToEmail(username: string): string {
  return `${username}@fluxo.app`;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const isAuthenticated = !!user;
  const username = user?.user_metadata?.username ?? user?.email?.split("@")[0] ?? null;

  // Listen for Supabase auth state changes
  useEffect(() => {
    // Get current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setHydrated(true);
    });

    // Subscribe to auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
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

  const login = useCallback(
    async (usernameInput: string, password: string): Promise<string | null> => {
      const email = usernameToEmail(usernameInput);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) return error.message;
      return null; // success
    },
    []
  );

  const logout = useCallback(() => {
    supabase.auth.signOut();
    router.replace("/");
  }, [router]);

  // Don't render until hydrated to avoid flash
  if (!hydrated) {
    return null;
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, username, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
