// frontend/src/app/profile/page.tsx
"use client";

import React from "react";
import { useAuthContext } from "@/contexts/AuthContext";

export default function ProfilePage() {
  const { user, loading, error } = useAuthContext();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-gray-600 text-lg">読み込み中です...</p>
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

  if (!user) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen">
        <p className="text-gray-700">ログインしていません。</p>
        <a href="/login" className="text-blue-600 hover:underline mt-2">
          ログインページへ
        </a>
      </div>
    );
  }

  return (
    <div className="flex flex-col justify-center items-center min-h-screen">
      <h1 className="text-2xl font-bold mb-6">プロフィール情報</h1>
      <div className="bg-white shadow-md rounded-lg p-6 w-80 border">
        <p className="mb-2">
          <span className="font-semibold">UID：</span> {user.uid}
        </p>
        <p className="mb-2">
          <span className="font-semibold">メールアドレス：</span> {user.email ?? "未設定"}
        </p>
      </div>
    </div>
  );
}
