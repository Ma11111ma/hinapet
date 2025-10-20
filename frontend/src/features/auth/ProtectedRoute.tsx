"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./AuthProvider";

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, initialized, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (initialized && !user) {
      router.replace("/auth/login");
    }
  }, [initialized, user, router]);

  if (!initialized || loading) return <p>読み込み中...</p>;
  if (!user) return null; // 未ログインなら描画しない

  return <>{children}</>;
}
