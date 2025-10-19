// src/app/profile/page.tsx
"use client";

import { useAuth } from "@/features/auth/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login"); // 未ログインなら /login にリダイレクト
    }
  }, [user, loading, router]);

  if (loading) return <p>読み込み中...</p>;
  if (!user) return null; // リダイレクト中

  return (
    <div>
      <h1>マイページ</h1>
      <p>UID: {user.id}</p>
      <p>名前: {user.name}</p>
      <p>メール: {user.email}</p>
    </div>
  );
}
