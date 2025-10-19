"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/AuthProvider";

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [showPage, setShowPage] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace("/login"); // 未ログインなら /login にリダイレクト
      } else {
        setShowPage(true); // ログイン済みならページ表示
      }
    }
  }, [loading, user, router]);

  // user が null の場合は読み込み中表示
  if (loading || !showPage || !user) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-gray-600 text-lg">読み込み中です...</p>
      </div>
    );
  }

  // ここからは user は絶対に null ではないと TypeScript に伝える
  const currentUser = user!;

  return (
    <div className="flex flex-col justify-center items-center min-h-screen">
      <h1 className="text-2xl font-bold mb-6">プロフィール情報</h1>
      <div className="bg-white shadow-md rounded-lg p-6 w-80 border">
        <p className="mb-2">
          <span className="font-semibold">メールアドレス：</span> {currentUser.email ?? "未設定"}
        </p>
        <p className="mb-2">
          <span className="font-semibold">名前：</span> {currentUser.displayName ?? "未設定"}
        </p>
      </div>
    </div>
  );
}
