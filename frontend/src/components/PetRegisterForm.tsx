"use client";
import { useState } from "react";

export type PetForm = {
  name: string;
  species: string;   // 犬/猫など
  breed?: string;    // 犬種・猫種
  sex?: string;      // オス/メス
  birthday?: string; // YYYY-MM-DD
  weight?: string;
  temperament?: string; // 性格・注意点
  medical?: string;     // ワクチン/投薬/アレルギー 等メモ
  character?: string;     // 性格・注意点（UI上のテキスト）
  medicalMemo?: string;   // 医療メモ（ワクチン/投薬/アレルギー）
  microchip?: string;     // マイクロチップ番号

};

export default function PetRegisterForm({ onSubmit }: { onSubmit: (d: PetForm)=>Promise<void> }) {
  const [f, setF] = useState<PetForm>({ name: "", species: "" });
  const [loading, setLoading] = useState(false);
  const [ok, setOk] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const input = (k: keyof PetForm) => (e: any) => setF({ ...f, [k]: e.target.value });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null); setOk(false); setLoading(true);
    try { await onSubmit(f); setOk(true); setF({ name: "", species: "" }); }
    catch (e: any) { setErr(e?.message ?? "登録に失敗しました"); }
    finally { setLoading(false); }
  };

  return (
    <form onSubmit={submit} className="space-y-3">
      <div><label className="block text-sm mb-1">ペット名</label><input className="w-full border rounded px-3 py-2" value={f.name} onChange={input("name")} required/></div>
      <div><label className="block text-sm mb-1">種類（犬・猫など）</label><input className="w-full border rounded px-3 py-2" value={f.species} onChange={input("species")} required/></div>
      <div className="grid grid-cols-2 gap-3">
        <div><label className="block text-sm mb-1">犬種/猫種</label><input className="w-full border rounded px-3 py-2" value={f.breed ?? ""} onChange={input("breed")} /></div>
        <div><label className="block text-sm mb-1">性別</label><input className="w-full border rounded px-3 py-2" value={f.sex ?? ""} onChange={input("sex")} /></div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div><label className="block text-sm mb-1">誕生日</label><input type="date" className="w-full border rounded px-3 py-2" value={f.birthday ?? ""} onChange={input("birthday")} /></div>
        <div><label className="block text-sm mb-1">体重</label><input className="w-full border rounded px-3 py-2" value={f.weight ?? ""} onChange={input("weight")} /></div>
      </div>
      <div><label className="block text-sm mb-1">性格・注意点</label><textarea className="w-full border rounded px-3 py-2" rows={2} value={f.temperament ?? ""} onChange={input("temperament")} /></div>
      <div><label className="block text-sm mb-1">医療メモ（ワクチン/投薬/アレルギー）</label><textarea className="w-full border rounded px-3 py-2" rows={3} value={f.medical ?? ""} onChange={input("medical")} /></div>
      <div><label className="block text-sm mb-1">マイクロチップ番号</label><input className="w-full border rounded px-3 py-2" value={f.microchip ?? ""} onChange={input("microchip")} /></div>

      <button disabled={loading} className={`px-4 py-2 rounded text-white ${loading ? "bg-indigo-300" : "bg-indigo-600"}`}>
        {loading ? "登録中…" : "登録する"}
      </button>

      {ok && <p className="text-green-600">登録しました</p>}
      {err && <p className="text-red-600">エラー: {err}</p>}
    </form>
  );
}
