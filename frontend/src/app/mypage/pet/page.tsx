"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { auth } from "@/lib/firebaseClient";

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

  useEffect(() => {
    (async () => {
      try {
        const u = auth.currentUser;
        if (!u) return;
        const idToken = await u.getIdToken();
        const res = await fetch(`${API}/pets?owner=me`, {
          headers: { Authorization: `Bearer ${idToken}` },
        });
        if (!res.ok) throw new Error(await res.text());
        setPets(await res.json());
      } catch (e: any) {
        setErr(e?.message ?? "読み込みに失敗しました");
      }
    })();
  }, []);

  return (
    <main className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">ペット情報</h2>
        <Link className="px-3 py-2 rounded bg-indigo-600 text-white" href="/mypage/pet/new">＋ 新規登録</Link>
      </div>

      {err && <p className="text-red-600 mb-2">エラー: {err}</p>}

      <ul className="space-y-2">
        {pets.map((p) => (
          <li key={p.id} className="border rounded p-3">
            <p className="font-medium">{p.name}</p>
            <p className="text-sm text-gray-500">{p.species}{p.sex ? `・${p.sex}` : ""}</p>
          </li>
        ))}
        {pets.length === 0 && <p className="text-gray-500">登録されたペットはいません</p>}
      </ul>
    </main>
  );
}
