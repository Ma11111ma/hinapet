// frontend/src/app/pet/page.tsx
"use client";

import { useAuth } from "@/features/auth/AuthProvider"; // AuthProvider.tsx の useAuth を直接使う

export default function PetPage() {
  const { user } = useAuth(); // 型は AuthContextType になるので user プロパティが正しく認識されます

  return (
    <div>
      <h2>{user?.displayName ?? "あなた"}のペットページ</h2>
      <p>ここにペット用情報を表示できます</p>
    </div>
  );
}
