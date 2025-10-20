// frontend/src/features/auth/ProtectedRoute.tsx
"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./AuthProvider";

interface ProtectedRouteProps {
  children: ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading, initialized } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (initialized && !user) {
      router.replace("/auth/login"); // 未ログインなら /auth/login
    }
  }, [initialized, user, router]);

  if (!initialized || loading) return <p>読み込み中...</p>;
  if (!user) return null;

  return <>{children}</>;
};
