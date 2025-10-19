// frontend/src/features/auth/AuthProvider.tsx
"use client";

import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import { auth, googleProvider } from "@/lib/firebaseClient";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  onAuthStateChanged,
  User,
} from "firebase/auth";
import { AuthVerifyResponse } from "@/types/api";
import { postSession } from "@/lib/apiClient";

// Contextで提供する値の型
type AuthContextValue = {
  user: AuthVerifyResponse | null;
  loading: boolean;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// Providerコンポーネント
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthVerifyResponse | null>(null);
  const [loading, setLoading] = useState(true);

  // Firebase 認証状態変化を監視
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: User | null) => {
      setLoading(true);
      try {
        if (firebaseUser) {
          const idToken = await firebaseUser.getIdToken();
          const userData: AuthVerifyResponse = await postSession(idToken);
          setUser(userData);
        } else {
          setUser(null);
        }
      } finally {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  // メール/パスワードログイン
  const signInWithEmail = async (email: string, password: string) => {
    setLoading(true);
    try {
      const credential = await signInWithEmailAndPassword(auth, email, password);
      const idToken = await credential.user.getIdToken();
      const userData: AuthVerifyResponse = await postSession(idToken);
      setUser(userData);
    } finally {
      setLoading(false);
    }
  };

  // Googleログイン
  const signInWithGoogle = async () => {
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();
      const userData: AuthVerifyResponse = await postSession(idToken);
      setUser(userData);
    } finally {
      setLoading(false);
    }
  };

  // ログアウト
  const signOutUser = async () => {
    setLoading(true);
    try {
      await auth.signOut();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInWithEmail, signInWithGoogle, signOut: signOutUser }}>
      {children}
    </AuthContext.Provider>
  );
};

// カスタムフック
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
