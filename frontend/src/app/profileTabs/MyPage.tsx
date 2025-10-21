"use client";

import { useAuth } from "@/features/auth/AuthProvider";

export default function MyPage() {
  const { user } = useAuth();

  return (
    <div>
      <h2>{user?.displayName ?? "あなた"}のマイページ</h2>
      <p>ここにユーザー情報を表示</p>
    </div>
  );
}
