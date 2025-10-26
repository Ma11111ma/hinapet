"use client";
import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";
import PetRegisterForm from "@/components/PetRegisterForm";
import { PetForm } from "../components/PetRegisterForm";

/** 🐾 チェックリスト項目型 */
type ChecklistItem = {
  id: string;
  name: string;
  checked: boolean;
  expiry?: string;
};

/** 🐕 ペット情報型 */
type PetData = {
  id: string;
  name: string;
  gender?: "男の子" | "女の子";
  birthdate?: string;
  neutered?: "未" | "済";
  species?: "犬" | "猫" | "その他";
  speciesOther?: string;
  clinicName?: string;
  history?: string;
  medication?: string;
  memo?: string;
  photoUrl?: string;
};

export default function PetInfoPanel() {
  const [pets, setPets] = useState<PetData[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);

  /** ✅ ペット情報を localStorage から読み込み */
  useEffect(() => {
    const savedPets = localStorage.getItem("pets");
    if (savedPets) {
      try {
        setPets(JSON.parse(savedPets));
      } catch {
        console.warn("ペット情報の読み込みに失敗しました");
      }
    }
  }, []);

  /** ✅ ペット情報を localStorage に保存 */
  const savePets = (newPets: PetData[]) => {
    setPets(newPets);
    localStorage.setItem("pets", JSON.stringify(newPets));
  };

  /** ✅ ペット追加 */
  const addPet = () => {
    const newPet: PetData = {
      id: crypto.randomUUID(),
      name: "ペットのお名前",
    };
    savePets([...pets, newPet]);
  };

  /** ✅ ペット更新（フォームから受け取る） */
  const updatePet = (id: string, updated: Partial<PetData>) => {
    const newList = pets.map((p) => (p.id === id ? { ...p, ...updated } : p));
    savePets(newList);
  };

  /** ✅ ペット削除 */
  const removePet = (id: string) => {
    if (!confirm("このペット情報を削除しますか？")) return;
    const updated = pets.filter((p) => p.id !== id);
    savePets(updated);
  };

  /** ✅ 初期チェックリスト */
  const defaultChecklist: ChecklistItem[] = [
    { id: crypto.randomUUID(), name: "フード（5日分）", checked: false },
    { id: crypto.randomUUID(), name: "水（5日分）", checked: false },
    { id: crypto.randomUUID(), name: "食器", checked: false },
    { id: crypto.randomUUID(), name: "処方薬", checked: false },
    { id: crypto.randomUUID(), name: "リード", checked: false },
    { id: crypto.randomUUID(), name: "首輪", checked: false },
    {
      id: crypto.randomUUID(),
      name: "キャリーバック（クレート）",
      checked: false,
    },
    {
      id: crypto.randomUUID(),
      name: "ケージ（同行避難の際に必要）",
      checked: false,
    },
    { id: crypto.randomUUID(), name: "タオル・毛布", checked: false },
    { id: crypto.randomUUID(), name: "ペットシーツ・新聞紙", checked: false },
  ];

  /** ✅ チェックリスト localStorage 読み込み */
  useEffect(() => {
    const saved = localStorage.getItem("pet-checklist");
    if (saved) {
      setChecklist(JSON.parse(saved));
    } else {
      setChecklist(defaultChecklist);
    }
  }, []);

  /** ✅ チェック更新 */
  const toggleCheck = (id: string) => {
    setChecklist((prev) =>
      prev.map((i) => (i.id === id ? { ...i, checked: !i.checked } : i))
    );
  };

  /** ✅ 賞味期限更新 */
  const updateExpiry = (id: string, date: string) => {
    setChecklist((prev) =>
      prev.map((i) => (i.id === id ? { ...i, expiry: date } : i))
    );
  };

  /** ✅ 一括保存 */
  const handleSaveAll = () => {
    localStorage.setItem("pet-checklist", JSON.stringify(checklist));
    alert("チェックリストを更新しました！");
  };

  return (
    <div className="py-4 text-stone-800 min-h-full">
      <h1 className="text-xl font-bold mb-4">🐾 ペット情報一覧</h1>

      {/* ペット一覧 */}
      <div className="space-y-4">
        {pets.map((p) => (
          <div
            key={p.id}
            className="bg-white border border-stone-200 rounded-2xl shadow-sm overflow-hidden"
          >
            {/* ヘッダー */}
            <div
              onClick={() => setExpanded(expanded === p.id ? null : p.id)}
              className="flex justify-between items-center w-full px-4 py-3 text-left font-semibold bg-amber-100 hover:bg-amber-200 transition cursor-pointer border-b border-stone-200"
            >
              <span>{p.name || "名前未設定"}</span>
              <div className="flex items-center gap-2">
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    removePet(p.id);
                  }}
                  className="text-red-500 hover:text-red-700 cursor-pointer"
                  role="button"
                  aria-label="削除"
                >
                  <Trash2 size={18} />
                </div>
                {expanded === p.id ? <ChevronUp /> : <ChevronDown />}
              </div>
            </div>

            {/* 展開部分 */}
            {expanded === p.id && (
              <div className="p-4 bg-amber-50">
                <PetRegisterForm
                  defaultValues={p}
                  onSubmit={async (updatedData: PetForm) => {
                    updatePet(p.id, updatedData);
                    alert("ペット情報を保存しました！");
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
      <div className="mt-2 flex justify-end pr-1">
        <button
          onClick={addPet}
          className="flex items-center gap-1 px-3 py-1.5 text-sm bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition"
        >
          <Plus size={14} /> ペットを追加
        </button>
      </div>

      {/* チェックリスト */}
      <section className="mt-6 bg-white rounded-2xl shadow-sm p-5 border border-stone-200">
        <button
          onClick={() =>
            setExpanded(expanded === "checklist" ? null : "checklist")
          }
          className="w-full text-left flex items-center justify-between font-semibold text-lg text-stone-700 hover:text-amber-700 transition"
        >
          🧳 ペット持ち物チェックリスト
          {expanded === "checklist" ? (
            <ChevronUp className="text-amber-600" />
          ) : (
            <ChevronDown className="text-amber-600" />
          )}
        </button>

        <div
          className={`transition-all duration-500 ease-in-out ${
            expanded === "checklist" ? "mt-4" : "mt-2"
          }`}
        >
          <ul className="space-y-3">
            {checklist.map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between border-b border-stone-200 pb-2"
              >
                <label className="flex items-center gap-2 flex-1">
                  <input
                    type="checkbox"
                    checked={item.checked}
                    onChange={() => toggleCheck(item.id)}
                    className="w-5 h-5 accent-amber-500"
                  />
                  <span
                    className={`transition text-sm ${
                      item.checked
                        ? "line-through text-gray-400"
                        : "text-stone-700"
                    }`}
                  >
                    {item.name}
                  </span>
                </label>

                {item.name.includes("フード") && (
                  <div className="flex flex-col items-start ml-2">
                    <label className="text-xs text-stone-500 mb-1">
                      賞味期限
                    </label>
                    <input
                      type="date"
                      value={item.expiry ?? ""}
                      onChange={(e) => updateExpiry(item.id, e.target.value)}
                      className="appearance-none border border-stone-300 rounded px-2 py-1 text-sm"
                      onFocus={(e) => e.target.showPicker?.()}
                    />
                  </div>
                )}
              </li>
            ))}
          </ul>

          {/* 一括更新 */}
          <div className="mt-4 text-right">
            <button
              onClick={handleSaveAll}
              className="px-4 py-2 bg-amber-500 text-white rounded hover:bg-amber-600 transition"
            >
              更新する
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
