"use client";
import { useEffect, useState } from "react";

type UserForm = {
  full_name: string;
  phone: string;
  address: string;
  emergency_contact: string;
  memo: string;
  email?: string; // 表示用
};

type Props = {
  initial?: Partial<UserForm>;
  onSubmit: (data: UserForm) => Promise<void>;
};

export default function UserRegisterForm({ initial, onSubmit }: Props) {
  const [form, setForm] = useState<UserForm>({
    full_name: "",
    phone: "",
    address: "",
    emergency_contact: "",
    memo: "",
    email: "",
    ...initial,
  });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  useEffect(() => {
    if (initial) setForm((f) => ({ ...f, ...initial }));
  }, [initial]);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErr(null);
    setOk(false);
    setLoading(true);
    try {
      await onSubmit(form);
      setOk(true);
    } catch (e: unknown) {
      if (e instanceof Error) {
        setErr(e.message);
      } else {
        setErr("送信に失敗しました");
      }
    } finally {
      setLoading(false);
    }
  };

  const input =
    (k: keyof UserForm) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm({ ...form, [k]: e.target.value });

  return (
    // ★変更: トンマナをペット情報と完全統一（背景 + 影 + 角丸）
    <form
      onSubmit={submit}
      className="space-y-5 bg-amber-50 p-5 rounded-2xl shadow-sm border border-stone-200"
    >
      <h2 className="text-lg font-bold text-stone-800 mb-2">ユーザー情報</h2>

      {/* 氏名 */}
      <div>
        <label className="block text-sm mb-1 text-stone-700">氏名</label>
        <input
          className="w-full border border-stone-300 rounded px-3 py-2 bg-white focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none transition"
          value={form.full_name}
          onChange={input("full_name")}
        />
      </div>

      {/* 電話番号 */}
      <div>
        <label className="block text-sm mb-1 text-stone-700">電話番号</label>
        <input
          type="tel"
          className="w-full border border-stone-300 rounded px-3 py-2 bg-white focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none transition"
          value={form.phone}
          onChange={input("phone")}
        />
      </div>

      {/* 住所 */}
      <div>
        <label className="block text-sm mb-1 text-stone-700">住所</label>
        <input
          className="w-full border border-stone-300 rounded px-3 py-2 bg-white focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none transition"
          value={form.address}
          onChange={input("address")}
        />
      </div>

      {/* 緊急連絡先 */}
      <div>
        <label className="block text-sm mb-1 text-stone-700">緊急連絡先</label>
        <input
          className="w-full border border-stone-300 rounded px-3 py-2 bg-white focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none transition"
          value={form.emergency_contact}
          onChange={input("emergency_contact")}
        />
      </div>

      {/* メモ */}
      <div>
        <label className="block text-sm mb-1 text-stone-700">
          メモ（アレルギー・持病等）
        </label>
        <textarea
          className="w-full border border-stone-300 rounded px-3 py-2 bg-white focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none transition"
          rows={3}
          value={form.memo}
          onChange={input("memo")}
        />
      </div>

      <div>
        <label className="block text-sm mb-1 text-stone-700">
          メールアドレス
        </label>
        <input
          type="email"
          readOnly
          className="w-full border border-stone-300 rounded px-3 py-2 bg-stone-100 text-stone-700 cursor-not-allowed"
          value={form.email ?? ""}
          placeholder="サインイン中のメールアドレス"
        />
      </div>

      {/* ★変更: amber系の保存ボタンに変更 */}
      <button
        disabled={loading}
        className={`w-full py-2 rounded-md text-white font-medium shadow-sm transition ${
          loading
            ? "bg-amber-300 cursor-not-allowed"
            : "bg-amber-500 hover:bg-amber-600"
        }`}
      >
        {loading ? "保存中…" : "保存する"}
      </button>

      {/* メッセージ */}
      {ok && <p className="text-green-600 text-sm">保存しました</p>}
      {err && <p className="text-red-600 text-sm">エラー: {err}</p>}
    </form>
  );
}
