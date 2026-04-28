"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useQuery as useConvexQuery, useMutation as useConvexMutation } from "convex/react";

interface AuthUser {
  userId: string;
  email: string;
  token: string;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  setAuth: (user: AuthUser) => void;
  clearAuth: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_KEY = "mflmr_session";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(AUTH_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setUser(parsed);
      }
    } catch {}
    setIsLoading(false);
  }, []);

  const setAuth = useCallback((newUser: AuthUser) => {
    setUser(newUser);
    localStorage.setItem(AUTH_KEY, JSON.stringify(newUser));
  }, []);

  const clearAuth = useCallback(() => {
    setUser(null);
    localStorage.removeItem(AUTH_KEY);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token: user?.token ?? null, isLoading, setAuth, clearAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

// Custom wrapper to automatically inject token into args
export function useAuthQuery(query: any, args?: any) {
  const { token } = useAuth();
  // We only run the query if we have a token, else we pass "skip" (so it doesn't fail).
  // Wait, if it's "skip", convex returns undefined while skipping.
  if (args === "skip") return useConvexQuery(query, "skip");
  const queryArgs = token ? { ...args, token } : "skip";
  return useConvexQuery(query, queryArgs as any);
}

export function useAuthMutation(mutation: any) {
  const { token } = useAuth();
  const mutate = useConvexMutation(mutation);
  return useCallback(
    (args?: any) => {
      return mutate({ ...args, token });
    },
    [mutate, token]
  );
}
