// frontend/src/features/auth/useAuth.tsx
"use client";

import { useState, useEffect, createContext, useContext } from "react";
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
  loading: boolean; // ←追加
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<AuthVerifyResponse | null>(null);
  const [loading, setLoading] = useState(true);

  // Firebase 認証状態変化時の処理
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (firebaseUser: User | null) => {
        setLoading(true);
        try {
          if (firebaseUser) {
            const idToken = await firebaseUser.getIdToken();
            const userData: AuthVerifyResponse = await postSession(idToken);
            setUser(userData);
          } else {
            setUser(null);
          }
        } catch (err) {
          console.error("🔥 AuthStateChanged error:", err);
          setUser(null);
        } finally {
          setLoading(false);
        }
      }
    );
    return () => unsubscribe();
  }, []);

  // メール/パスワードログイン
  const signInWithEmail = async (email: string, password: string) => {
    setLoading(true);
    try {
      const credential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const idToken = await credential.user.getIdToken();
      const userData: AuthVerifyResponse = await postSession(idToken);
      setUser(userData);
    } catch (err) {
      console.error("🔥 signInWithEmail error:", err);
      throw err;
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
    } catch (err) {
      console.error("🔥 signInWithGoogle error:", err);
      throw err;
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
    } catch (err) {
      console.error("🔥 signOut error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        signInWithEmail,
        signInWithGoogle,
        signOut: signOutUser,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// カスタムフック
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
