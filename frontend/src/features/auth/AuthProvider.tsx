"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { auth } from "@/lib/firebaseClient";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  User,
} from "firebase/auth";

export interface AuthContextType {
  user: (User & { is_premium?: boolean }) | null;
  loading: boolean;
  initialized: boolean;
  signInWithEmail: (email: string, password: string) => Promise<{ user: User }>;
  signInWithGoogle: () => Promise<{ user: User }>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<(User & { is_premium?: boolean }) | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Firebaseトークンを取得して /users/me に問い合わせ
          const token = await firebaseUser.getIdToken();
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/users/me`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
              credentials: "include",
            }
          );

          if (res.ok) {
            const serverUser = await res.json();
            // FastAPIのis_premiumを統合
            setUser({
              ...firebaseUser,
              is_premium: serverUser?.is_premium ?? false,
            });
          } else {
            // バックエンド未接続でもFirebase情報だけ維持
            setUser({ ...firebaseUser, is_premium: false });
          }
        } catch (error) {
          console.error("❌ /users/me fetch error:", error);
          setUser({ ...firebaseUser, is_premium: false });
        }
      } else {
        setUser(null);
      }
      setLoading(false);
      setInitialized(true);
    });

    return () => unsubscribe();
  }, []);

  const signInWithEmail = async (email: string, password: string) => {
    const result = await signInWithEmailAndPassword(auth, email, password);
    setUser(result.user);
    return { user: result.user };
  };

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    setUser(result.user);
    return { user: result.user };
  };

  const value: AuthContextType = {
    user,
    loading,
    initialized,
    signInWithEmail,
    signInWithGoogle,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// ✅ useAuth をここで一緒にエクスポート
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
