"use client";

import React, { ReactNode, useEffect } from "react";
import { useAuth } from "./AuthProvider"; // AuthProvider.tsx 内で export されている useAuth
import { useRouter } from "next/navigation";

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading, initialized } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (initialized && !user) {
      router.replace("/auth/login"); // 未ログインなら /auth/login にリダイレクト
    }
  }, [initialized, user, router]);

  if (!initialized || loading || !user) return <p>読み込み中...</p>;

  return <>{children}</>;
}
