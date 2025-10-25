"use client";

import { useEffect, useState } from "react";
import UserRegisterForm from "@/components/UserRegisterForm";
import { auth } from "@/lib/firebaseClient";
import { onAuthStateChanged, User } from "firebase/auth";

/** 🔹 ユーザーフォーム型 */
type UserFormData = {
  full_name?: string;
  phone?: string;
  address?: string;
  emergency_contact?: string;
  memo?: string;
  email?: string;
};

/** 🔹 環境変数 */
const API = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

/**
 * ✅ ユーザー情報フォーム（/mypage の「ユーザー情報」タブに表示）
 */
export default function UserInfoForm() {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [initial, setInitial] = useState<UserFormData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setFirebaseUser(user);
        setError(null);
        setLoading(true);

        try {
          let idToken = await user.getIdToken(true);
          let res = await fetch(`${API}/users/me`, {
            headers: { Authorization: `Bearer ${idToken}` },
          });

          if (res.status === 401) {
            idToken = await user.getIdToken(true);
            res = await fetch(`${API}/users/me`, {
              headers: { Authorization: `Bearer ${idToken}` },
            });
          }

          if (res.ok) {
            const data = await res.json();
            setInitial({
              full_name: data.full_name ?? "",
              phone: data.phone ?? "",
              address: data.address ?? "",
              emergency_contact: data.emergency_contact ?? "",
              memo: data.memo ?? "",
              email: user.email ?? "",
            });
          } else {
            setInitial({ email: user.email ?? "" });
          }
        } catch (e) {
          console.error("ユーザー情報取得エラー:", e);
          setError("ユーザー情報の取得に失敗しました");
        } finally {
          setLoading(false);
        }
      } else {
        setFirebaseUser(null);
        setError("未ログインです");
        setLoading(false);
      }
    });

    return () => unsubscribe(); // ★クリーンアップ
  }, []);

  // 保存処理（PUT）
  const handleSubmit = async (form: UserFormData): Promise<void> => {
    const u = auth.currentUser;
    if (!u) throw new Error("未ログインです");

    let idToken = await u.getIdToken(true);
    let res = await fetch(`${API}/users/me`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify(form),
    });

    if (res.status === 401) {
      idToken = await u.getIdToken(true);
      res = await fetch(`${API}/users/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify(form),
      });
    }

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`${res.status} ${text}`);
    }

    alert("ユーザー情報を更新しました！");
  };

  // === ローディング・エラー処理 ===
  if (loading) {
    return (
      <div className="flex justify-center items-center h-40 text-stone-500">
        読み込み中です…
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-600 text-center py-4 bg-red-50 rounded-lg border border-red-200">
        {error}
      </div>
    );
  }

  // === 通常表示 ===
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-stone-200">
      <h2 className="text-lg font-bold mb-4 text-stone-800">ユーザー情報</h2>
      <UserRegisterForm initial={initial ?? {}} onSubmit={handleSubmit} />
    </div>
  );
}
