"use client";
import { useEffect, useState } from "react";
import UserRegisterForm from "@/components/UserRegisterForm";
import { auth } from "@/lib/firebaseClient";

const API = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

export default function UserPage() {
  const [initial, setInitial] = useState<any>(null);

  useEffect(() => {
    (async () => {
      const u = auth.currentUser;
      if (!u) return;
      // ★ 強制リフレッシュして取得。401が出たら一度だけ再試行
      let idToken = await u.getIdToken(true);
      let res = await fetch(`${API}/users/me`, {
        headers: { Authorization: `Bearer ${idToken}` },
      });
      if (res.status === 401) {
        idToken = await u.getIdToken(true);
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
          email: u.email ?? "",
        });
      } else {
        setInitial({ email: u.email ?? "" });
      }
    })();
  }, []);

  const handleSubmit = async (form: any) => {
    const u = auth.currentUser;
    if (!u) throw new Error("未ログインです");
    // ★ 送信時も同様に強制リフレッシュ＋401で一度だけ再試行
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
  };

  return (
    <main className="max-w-3xl mx-auto p-6">
      <h2 className="text-lg font-semibold mb-4">ユーザー情報</h2>
      <UserRegisterForm initial={initial ?? {}} onSubmit={handleSubmit} />
    </main>
  );
}
