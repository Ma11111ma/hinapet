"use client";

import { FormEvent } from "react";
import Image from "next/image";
import { usePetFormStore } from "@/store/petFormStore";

type Props = {
  onSubmit: () => Promise<void>;
};

export default function PetRegisterForm({ onSubmit }: Props) {
  const { data: f, setField } = usePetFormStore();

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await onSubmit(); // ✅ /mypage/pet/new/page.tsx で定義した保存処理を呼び出す
  };

  return (
    <form
      onSubmit={submit}
      className="space-y-4 bg-amber-50 p-4 rounded-2xl shadow-sm"
    >
      {/* 写真 */}
      <div>
        <label className="block text-sm mb-1">写真（任意）</label>
        <input
          type="file"
          accept="image/*"
          className="text-sm"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              const url = URL.createObjectURL(file);
              setField("photoUrl", url);
            }
          }}
        />
        {f.photoUrl && (
          <div className="mt-2 relative w-32 h-32">
            <Image
              src={f.photoUrl}
              alt="ペット写真プレビュー"
              fill
              className="object-cover rounded-md border"
            />
          </div>
        )}
      </div>

      {/* 名前 */}
      <div>
        <label className="block text-sm mb-1">名前 *</label>
        <input
          required
          className="w-full border rounded px-3 py-2 bg-white focus:ring-2 focus:ring-amber-400"
          value={f.name}
          onChange={(e) => setField("name", e.target.value)}
        />
      </div>

      {/* 性別 */}
      <div>
        <label className="block text-sm mb-1">性別</label>
        <div className="flex gap-3">
          {["女の子", "男の子"].map((g) => (
            <button
              type="button"
              key={g}
              onClick={() => setField("gender", g as "女の子" | "男の子")}
              className={`px-3 py-1 rounded border transition ${
                f.gender === g
                  ? "bg-amber-500 text-white border-amber-500"
                  : "bg-white hover:bg-amber-100"
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      {/* 生年月日 */}
      <div>
        <label className="block text-sm mb-1">生年月日</label>
        <input
          type="date"
          className="w-full border rounded px-3 py-2 bg-white focus:ring-2 focus:ring-amber-400"
          value={f.birthdate ?? ""}
          onChange={(e) => setField("birthdate", e.target.value)}
        />
      </div>

      {/* 去勢避妊 */}
      <div>
        <label className="block text-sm mb-1">去勢避妊手術</label>
        <div className="flex gap-3">
          {["未", "済"].map((v) => (
            <button
              type="button"
              key={v}
              onClick={() => setField("neutered", v as "未" | "済")}
              className={`px-3 py-1 rounded border transition ${
                f.neutered === v
                  ? "bg-amber-500 text-white border-amber-500"
                  : "bg-white hover:bg-amber-100"
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {/* 種類 */}
      <div>
        <label className="block text-sm mb-1">動物の種類 *</label>
        <div className="flex gap-3">
          {["犬", "猫", "その他"].map((s) => (
            <button
              type="button"
              key={s}
              onClick={() => setField("species", s as "犬" | "猫" | "その他")}
              className={`px-3 py-1 rounded border transition ${
                f.species === s
                  ? "bg-amber-500 text-white border-amber-500"
                  : "bg-white hover:bg-amber-100"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        {f.species === "その他" && (
          <input
            placeholder="動物の種類を入力"
            className="mt-2 w-full border rounded px-3 py-2 bg-white focus:ring-2 focus:ring-amber-400"
            value={f.speciesOther ?? ""}
            onChange={(e) => setField("speciesOther", e.target.value)}
          />
        )}
      </div>

      {/* 医療情報 */}
      <div>
        <label className="block text-sm mb-1">かかりつけ動物病院</label>
        <input
          className="w-full border rounded px-3 py-2 bg-white focus:ring-2 focus:ring-amber-400"
          value={f.clinicName ?? ""}
          onChange={(e) => setField("clinicName", e.target.value)}
        />
      </div>

      <div>
        <label className="block text-sm mb-1">既往歴</label>
        <textarea
          className="w-full border rounded px-3 py-2 bg-white focus:ring-2 focus:ring-amber-400"
          rows={2}
          value={f.history ?? ""}
          onChange={(e) => setField("history", e.target.value)}
        />
      </div>

      <div>
        <label className="block text-sm mb-1">飲んでいる薬</label>
        <textarea
          className="w-full border rounded px-3 py-2 bg-white focus:ring-2 focus:ring-amber-400"
          rows={2}
          value={f.medication ?? ""}
          onChange={(e) => setField("medication", e.target.value)}
        />
      </div>

      <div>
        <label className="block text-sm mb-1">備考</label>
        <textarea
          className="w-full border rounded px-3 py-2 bg-white focus:ring-2 focus:ring-amber-400"
          rows={3}
          value={f.memo ?? ""}
          onChange={(e) => setField("memo", e.target.value)}
        />
      </div>

      {/* 登録ボタン */}
      <button
        className="px-4 py-2 rounded bg-amber-500 text-white hover:bg-amber-600 transition font-medium"
        type="submit"
      >
        保存する
      </button>
    </form>
  );
}
