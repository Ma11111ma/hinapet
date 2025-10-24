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
    setForm((f) => ({ ...f, ...initial }));
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
      // ✅ unknown でキャッチして、安全に判定
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
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label className="block text-sm mb-1">氏名</label>
        <input
          className="w-full border rounded px-3 py-2"
          value={form.full_name}
          onChange={input("full_name")}
        />
      </div>
      <div>
        <label className="block text-sm mb-1">電話番号</label>
        <input
          className="w-full border rounded px-3 py-2"
          value={form.phone}
          onChange={input("phone")}
        />
      </div>
      <div>
        <label className="block text-sm mb-1">住所</label>
        <input
          className="w-full border rounded px-3 py-2"
          value={form.address}
          onChange={input("address")}
        />
      </div>
      <div>
        <label className="block text-sm mb-1">緊急連絡先</label>
        <input
          className="w-full border rounded px-3 py-2"
          value={form.emergency_contact}
          onChange={input("emergency_contact")}
        />
      </div>
      <div>
        <label className="block text-sm mb-1">メモ（アレルギー・持病等）</label>
        <textarea
          className="w-full border rounded px-3 py-2"
          rows={3}
          value={form.memo}
          onChange={input("memo")}
        />
      </div>

      {form.email && (
        <p className="text-sm text-gray-500">サインイン中: {form.email}</p>
      )}

      <button
        disabled={loading}
        className={`px-4 py-2 rounded text-white ${
          loading ? "bg-indigo-300" : "bg-indigo-600"
        }`}
      >
        {loading ? "保存中…" : "保存する"}
      </button>

      {ok && <p className="text-green-600">保存しました</p>}
      {err && <p className="text-red-600">エラー: {err}</p>}
    </form>
  );
}
