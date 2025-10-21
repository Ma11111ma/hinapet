"use client";

import { useAuth } from "@/features/auth/AuthProvider";

export default function PetPage() {
  const { user } = useAuth();

  return (
    <div>
      <h2>{user?.displayName ?? "あなた"}のペット用マイページ</h2>
      <p>ここにペット情報を表示</p>
    </div>
  );
}
