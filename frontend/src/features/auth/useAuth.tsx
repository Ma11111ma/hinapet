"use client";

import { useState, useEffect, createContext, useContext } from "react";
import { auth, googleProvider } from "lib/firebaseClient";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  onAuthStateChanged,
  User,
} from "firebase/auth";
import { AuthVerifyResponse, LoginResponse } from "../../types/api";
import { postSession } from "../../lib/apiClient"; // ← 修正済み

type AuthContextValue = {
  user: AuthVerifyResponse | null;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthVerifyResponse | null>(null);

  // Firebase の認証状態が変わったときに backend へ verify
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: User | null) => {
      if (firebaseUser) {
        const idToken = await firebaseUser.getIdToken();
        const userData: LoginResponse = await postSession(idToken); // ← 直接呼び出す
        setUser(userData);
      } else {
        setUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  // メール/パスワードログイン
  const signInWithEmail = async (email: string, password: string) => {
    const credential = await signInWithEmailAndPassword(auth, email, password);
    const idToken = await credential.user.getIdToken();
    const userData: LoginResponse = await postSession(idToken);
    setUser(userData);
  };

  // Google ログイン
  const signInWithGoogle = async () => {
    const result = await signInWithPopup(auth, googleProvider);
    const idToken = await result.user.getIdToken();
    const userData: LoginResponse = await postSession(idToken);
    setUser(userData);
  };

  // ログアウト
  const signOutUser = async () => {
    await auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        signInWithEmail,
        signInWithGoogle,
        signOut: signOutUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// useAuth カスタムフック
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
