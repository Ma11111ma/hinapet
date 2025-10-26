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

// ✅ useAuth をここで export（最上位・コンポーネントの外）
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};

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
          const token = await firebaseUser.getIdToken();
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/users/me`,
            {
              headers: { Authorization: `Bearer ${token}` },
              credentials: "include",
            }
          );
          if (res.ok) {
            const serverUser = await res.json();
            setUser(
              Object.assign(firebaseUser, {
                is_premium: serverUser?.is_premium ?? false,
              })
            );
          } else {
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

  return (
    <AuthContext.Provider value={value}>
      {initialized ? (
        children
      ) : (
        <div className="text-center py-10 text-stone-500 text-sm">
          認証情報を読み込んでいます...
        </div>
      )}
    </AuthContext.Provider>
  );
};
