"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { auth, getIdToken } from "@/lib/firebaseClient";
import { onAuthStateChanged, User } from "firebase/auth";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  initialized: boolean; // 追加
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
      setInitialized(true); // 初期化完了
    });
    return () => unsubscribe();
  }, []);

  const value: AuthContextType = {
    user,
    loading,
    initialized,
    signInWithEmail: async (email, password) => {
      // Firebase ログイン処理
    },
    signInWithGoogle: async () => {
      // Firebase Google ログイン処理
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
