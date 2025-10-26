"use client";

import { useEffect, useState } from "react";
import { auth } from "@/lib/firebaseClient";
import { onAuthStateChanged } from "firebase/auth";
import UserRegisterForm from "@/components/UserRegisterForm";

/** 🔹 ユーザー情報型 */
type UserFormData = {
  full_name?: string;
  phone?: string;
  address?: string;
  emergency_contact?: string;
  memo?: string;
  email?: string;
};

/** 🔹 localStorage用キー */
const STORAGE_KEY = "user-info";

export default function UserInfoForm() {
  const [formData, setFormData] = useState<UserFormData | null>(null);
  const [loading, setLoading] = useState(true);

  // ✅ ページ初回ロード時：localStorageの情報を即反映
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setFormData(JSON.parse(saved));
      } catch {
        console.warn("ローカルユーザー情報の読み込みに失敗しました");
      }
    }
  }, []);

  // ✅ Firebaseログイン状態監視（ただし localStorage 情報は消さない）
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, () => {
      setLoading(false);
    });
    return () => unsub();
  }, []);

  // ✅ 保存処理：localStorageに即保存（APIも任意で呼び出し可）
  const handleSave = async (data: UserFormData) => {
    // localStorage に保存
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    setFormData(data);

    // FirebaseログインしていればAPIにPUT送信（任意）
    const u = auth.currentUser;
    if (u) {
      const API =
        process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
      try {
        const idToken = await u.getIdToken(true); // ← ✅ const に変更
        const res = await fetch(`${API}/users/me`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${idToken}`,
          },
          body: JSON.stringify(data),
        });
        if (!res.ok) console.warn("API保存エラー:", await res.text());
      } catch (e) {
        console.warn("API通信失敗:", e);
      }
    }

    alert("ユーザー情報を保存しました");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40 text-stone-500">
        読み込み中です…
      </div>
    );
  }

  return (
    <div className="bg-amber-100 rounded-2xl p-5 shadow-sm border border-stone-200">
      <UserRegisterForm initial={formData ?? {}} onSubmit={handleSave} />
    </div>
  );
}
