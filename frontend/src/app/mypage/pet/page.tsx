"use client";
import { useEffect, useState } from "react";
import { getIdToken } from "@/lib/firebaseClient";
import { useAuth } from "@/features/auth/AuthProvider";
import { usePetFormStore } from "@/store/petFormStore";
import PetRegisterForm from "@/components/PetRegisterForm";
import { ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";

type ChecklistItem = {
  id: string;
  name: string;
  checked: boolean;
  expiry?: string;
};

export default function PetPage() {
  const { pets, addPet, removePet } = usePetFormStore();
  const [expanded, setExpanded] = useState<string | null>(null);
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);

  /** ✅ localStorage 読み込み */
  useEffect(() => {
    const saved = localStorage.getItem("pet-checklist");
    if (saved) setChecklist(JSON.parse(saved));
  }, []);

  /** ✅ チェック更新 */
  const toggleCheck = (id: string) => {
    setChecklist((prev) => {
      const next = prev.map((i) =>
        i.id === id ? { ...i, checked: !i.checked } : i
      );
      localStorage.setItem("pet-checklist", JSON.stringify(next));
      return next;
    });
  };

  /** ✅ 賞味期限更新 */
  const updateExpiry = (id: string, date: string) => {
    setChecklist((prev) => {
      const next = prev.map((i) => (i.id === id ? { ...i, expiry: date } : i));
      localStorage.setItem("pet-checklist", JSON.stringify(next));
      return next;
    });
  };

  /** ✅ 項目追加 */
  const addChecklistItem = (name: string) => {
    if (!name.trim()) return;
    const newItem: ChecklistItem = {
      id: crypto.randomUUID(),
      name,
      checked: false,
    };
    const next = [...checklist, newItem];
    setChecklist(next);
    localStorage.setItem("pet-checklist", JSON.stringify(next));
  };

  /** ✅ ペット削除 */
  const handleDeletePet = (id: string) => {
    if (confirm("このペット情報を削除しますか？")) {
      removePet(id);
    }
  };

  return (
    <main className="max-w-4xl mx-auto py-6 px-4 bg-amber-50 min-h-screen text-stone-800">
      <h1 className="text-2xl font-bold mb-6">🐾 ペット情報一覧</h1>

      {/* ペットアコーディオン一覧 */}
      <div className="space-y-4">
        {pets.map((p) => (
          <div
            key={p.id}
            className="bg-white border rounded-2xl shadow-sm overflow-hidden"
          >
            {/* ヘッダー部分 */}
            <button
              onClick={() => setExpanded(expanded === p.id ? null : p.id)}
              className="flex justify-between items-center w-full px-4 py-3 text-left font-semibold bg-amber-100 hover:bg-amber-200 transition"
            >
              <span>{p.name || "名前未設定のペット"}</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeletePet(p.id);
                  }}
                  className="text-red-500 hover:text-red-700"
                  aria-label="削除"
                >
                  <Trash2 size={18} />
                </button>
                {expanded === p.id ? <ChevronUp /> : <ChevronDown />}
              </div>
            </button>

            {/* 展開コンテンツ */}
            {expanded === p.id && (
              <div className="p-4 border-t bg-amber-50">
                <PetRegisterForm
                  onSubmit={async () => {
                    alert("入力内容を保存しました（localStorage暗号化済）");
                  }}
                />
              </div>
            )}
          </div>
        ))}

        {pets.length === 0 && (
          <p className="text-stone-500 text-sm">
            まだペット情報が登録されていません。下の「＋ペットを追加」から登録してください。
          </p>
        )}
      </div>

      {/* ペット追加ボタン */}
      <div className="mt-6 flex justify-center">
        <button
          onClick={() => addPet()}
          className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition"
        >
          <Plus size={18} /> ペットを追加
        </button>
      </div>

      {/* チェックリストセクション */}
      <section className="mt-10 bg-white rounded-2xl shadow-sm p-5">
        <h2 className="text-xl font-semibold mb-4">
          🧳 ペット持ち物チェックリスト
        </h2>

        {checklist.length === 0 && (
          <p className="text-sm text-gray-500 mb-2">
            まだ項目がありません。下の入力欄から追加できます。
          </p>
        )}

        <ul className="space-y-3">
          {checklist.map((item) => (
            <li
              key={item.id}
              className="flex items-center justify-between border-b pb-2"
            >
              <label className="flex items-center gap-2 flex-1">
                <input
                  type="checkbox"
                  checked={item.checked}
                  onChange={() => toggleCheck(item.id)}
                  className="w-5 h-5 accent-amber-500"
                />
                <span
                  className={`${
                    item.checked ? "line-through text-gray-400" : ""
                  }`}
                >
                  {item.name}
                </span>
              </label>
              {item.name === "フード" && (
                <input
                  type="date"
                  value={item.expiry ?? ""}
                  onChange={(e) => updateExpiry(item.id, e.target.value)}
                  className="border rounded px-2 py-1 text-sm"
                />
              )}
            </li>
          ))}
        </ul>

        {/* 新規項目追加欄 */}
        <div className="mt-4 flex gap-2">
          <input
            type="text"
            placeholder="項目を追加（例：フード、ケージ）"
            id="newItem"
            className="flex-1 border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-amber-400"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                const value = (e.target as HTMLInputElement).value.trim();
                if (value) {
                  addChecklistItem(value);
                  (e.target as HTMLInputElement).value = "";
                }
              }
            }}
          />
          <button
            onClick={() => {
              const el = document.getElementById("newItem") as HTMLInputElement;
              if (el?.value.trim()) {
                addChecklistItem(el.value.trim());
                el.value = "";
              }
            }}
            className="px-4 py-2 bg-amber-500 text-white rounded hover:bg-amber-600"
          >
            追加
          </button>
        </div>
      </section>
    </main>
  );
}
