"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { auth, getIdToken } from "@/lib/firebaseClient";
import { useAuth } from "@/features/auth/AuthProvider";

const API = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

type Pet = {
  id: string;
  name: string;
  species: string;
  sex?: string;
};

export default function PetListPage() {
  const { user, loading, initialized } = useAuth();
  const [pets, setPets] = useState<Pet[]>([]);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (loading || !initialized) return; // Firebase準備が終わるまで待つ
    if (!user) {
      setErr("未ログインです。右下のボタンからログインしてください。");
      return;
    }

    (async () => {
      try {
        setErr(null);

        const idToken = await getIdToken(user);
        const res = await fetch(`${API}/users/me/pets`, {
          headers: { Authorization: `Bearer ${idToken}` },
        });

        if (!res.ok) throw new Error(await res.text());

        const json = await res.json();
        setPets(json.items ?? []);
      } catch (e) {
        setErr(e instanceof Error ? e.message : "読み込みに失敗しました");
      }
    })();
  }, [user, loading, initialized]);

  if (loading) {
    return <p className="text-gray-500">認証状態を確認中...</p>;
  }

  return (
    <main className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">ペット情報</h2>
        <Link
          className="px-3 py-2 rounded bg-indigo-600 text-white"
          href="/mypage/pet/new"
        >
          ＋ 新規登録
        </Link>
      </div>

      {loading && <p className="text-gray-500">読み込み中…</p>}
      {!loading && err && <p className="text-red-600 mb-2">エラー: {err}</p>}

      {!loading && !err && (
        <ul className="space-y-2">
          {pets.map((p) => (
            <li key={p.id} className="border rounded p-3">
              <p className="font-medium">{p.name}</p>
              <p className="text-sm text-gray-500">
                {p.species}
                {p.sex ? `・${p.sex}` : ""}
              </p>
            </li>
          ))}
          {pets.length === 0 && (
            <p className="text-gray-500">登録されたペットはいません</p>
          )}
        </ul>
      )}
    </main>
  );
}
