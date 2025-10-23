"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { auth, getIdToken } from "@/lib/firebaseClient";

const API = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

type Pet = {
  id: string;
  name: string;
  species: string;
  sex?: string;
};

export default function PetListPage() {
  const [pets, setPets] = useState<Pet[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setErr(null);
        setLoading(true);

        const u = auth.currentUser;
        if (!u) {
          setErr("未ログインです。右下のボタンからログインしてください。");
          setLoading(false);
          return;
        }

        // まず通常のトークンで取得
        let idToken = await getIdToken(u); // forceRefresh=false
        let res = await fetch(`${API}/pets?owner=me`, {
          headers: { Authorization: `Bearer ${idToken}` },
        });

        // 401 なら 1回だけ強制リフレッシュして再試行
        if (res.status === 401) {
          idToken = await getIdToken(u, true);
          res = await fetch(`${API}/pets?owner=me`, {
            headers: { Authorization: `Bearer ${idToken}` },
          });
        }

        if (res.status === 404) {
          // データが無いだけ（エラーではない）
          setPets([]);
          setLoading(false);
          return;
        }

        if (!res.ok) {
          throw new Error(await res.text());
        }

        const data: Pet[] = await res.json();
        setPets(data ?? []);
      } catch (e: any) {
        setErr(e?.message ?? "読み込みに失敗しました");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <main className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">ペット情報</h2>
        <Link className="px-3 py-2 rounded bg-indigo-600 text-white" href="/mypage/pet/new">
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
          {pets.length === 0 && <p className="text-gray-500">登録されたペットはいません</p>}
        </ul>
      )}
    </main>
  );
}
