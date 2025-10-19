// src/app/profile/page.tsx
"use client";

import { useAuth } from "@/features/auth/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ProfilePage() {
  const { user, loading, error } = useAuth();
  const router = useRouter();

  // 未ログイン時に /login へリダイレクト
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-gray-600 text-lg">読み込み中です…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen">
        <p className="text-red-600 font-semibold">エラーが発生しました</p>
        <p>{error}</p>
      </div>
    );
  }

  if (!user) return null; // リダイレクト中

  return (
    <div className="flex flex-col justify-center items-center min-h-screen">
      <h1 className="text-2xl font-bold mb-6">プロフィール情報</h1>
      <div className="bg-white shadow-md rounded-lg p-6 w-80 border">
        <p className="mb-2">
          <span className="font-semibold">名前：</span> {user.name ?? "未設定"}
        </p>
        <p className="mb-2">
          <span className="font-semibold">メールアドレス：</span> {user.email ?? "未設定"}
        </p>
      </div>
    </div>
  );
}
