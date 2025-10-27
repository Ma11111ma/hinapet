"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  loadShelterPatches,
  saveShelterPatches,
  upsertShelterPatch,
  removeShelterPatch,
  loadNotices,
  addNotice,
  saveNotices,
  type ShelterPatch,
  type Notice,
} from "@/lib/localAdmin";

// 淡い水色トーン（UIの一貫性）
const BG_BLUE = "bg-[#E8F6FB]";
const CARD_BORDER = "border-[#B5D3F2]";
const TITLE = "text-[#1C507C]";

type Crowd = "empty" | "few" | "full";

export default function AdminDashboardPage() {
  return (
    <main className={`min-h-screen ${BG_BLUE} p-6`}>
      <div className="mx-auto w-full max-w-5xl space-y-8">
        <h1 className={`text-2xl font-bold ${TITLE}`}>管理ダッシュボード</h1>
        <ShelterSection />
        <NoticeSection />
      </div>
    </main>
  );
}

/* =========================================================================
 *  避難所セクション（上段）
 * ========================================================================= */
function ShelterSection() {
  const [rows, setRows] = useState<ShelterPatch[]>([]);
  const [editing, setEditing] = useState<ShelterPatch>({
    id: "",
    name: "",
    address: "",
    phone: "",
    crowd_level: undefined,
    open: false,
    imageUrl: "",
    note: "",
  });

  // 初期ロード
  useEffect(() => {
    setRows(loadShelterPatches());
  }, []);

  // 保存→一覧を反映
  const handleSave = () => {
    if (!editing.id) {
      alert("ID は必須です");
      return;
    }
    upsertShelterPatch(editing);
    setRows(loadShelterPatches());
    alert("保存しました");
  };

  const handleDelete = (id: string) => {
    if (!confirm("削除しますか？")) return;
    removeShelterPatch(id);
    setRows(loadShelterPatches());
  };

  const resetForm = () =>
    setEditing({
      id: "",
      name: "",
      address: "",
      phone: "",
      crowd_level: undefined,
      open: false,
      imageUrl: "",
      note: "",
    });

  // --------- 型安全な onChange ヘルパー ---------
  const setField = <K extends keyof ShelterPatch>(key: K) => {
    return (
      e:
        | React.ChangeEvent<HTMLInputElement>
        | React.ChangeEvent<HTMLTextAreaElement>
    ) => {
      const value =
        e.currentTarget.type === "checkbox"
          ? (e.currentTarget as HTMLInputElement).checked
          : e.currentTarget.value;
      setEditing((prev) => ({ ...prev, [key]: value as ShelterPatch[K] }));
    };
  };

  const setCrowdLevel = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const v = e.currentTarget.value as "" | Crowd;
    setEditing((prev) => ({
      ...prev,
      crowd_level: v === "" ? undefined : v,
    }));
  };

  // 一覧の見やすい並び
  const sortedRows = useMemo(
    () => [...rows].sort((a, b) => a.id.localeCompare(b.id)),
    [rows]
  );

  return (
    <section
      className={`bg-white border ${CARD_BORDER} rounded-2xl shadow-sm p-5`}
    >
      <div className="flex items-center justify-between mb-3">
        <h2 className={`text-lg font-semibold ${TITLE}`}>避難所管理</h2>
        <button
          onClick={resetForm}
          className="px-3 py-1.5 text-sm rounded bg-white border border-blue-200 text-blue-700 hover:bg-blue-50"
        >
          フォームをクリア
        </button>
      </div>

      {/* フォーム */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
        <label className="text-sm">
          <span className="block text-gray-600 mb-1">ID（必須）</span>
          <input
            className="w-full border rounded px-3 py-2"
            placeholder="ID"
            value={editing.id}
            onChange={setField("id")}
          />
        </label>

        <label className="text-sm">
          <span className="block text-gray-600 mb-1">名称</span>
          <input
            className="w-full border rounded px-3 py-2"
            placeholder="名称"
            value={editing.name ?? ""}
            onChange={setField("name")}
          />
        </label>

        <label className="text-sm md:col-span-2">
          <span className="block text-gray-600 mb-1">住所</span>
          <input
            className="w-full border rounded px-3 py-2"
            placeholder="住所"
            value={editing.address ?? ""}
            onChange={setField("address")}
          />
        </label>

        <label className="text-sm">
          <span className="block text-gray-600 mb-1">電話番号</span>
          <input
            className="w-full border rounded px-3 py-2"
            placeholder="電話番号"
            value={editing.phone ?? ""}
            onChange={setField("phone")}
          />
        </label>

        <label className="text-sm">
          <span className="block text-gray-600 mb-1">混雑度</span>
          <select
            className="w-full border rounded px-3 py-2"
            value={editing.crowd_level ?? ""}
            onChange={setCrowdLevel}
          >
            <option value="">（未設定）</option>
            <option value="empty">空きあり</option>
            <option value="few">やや混雑</option>
            <option value="full">満員</option>
          </select>
        </label>

        <label className="text-sm flex items-center gap-2 mt-6">
          <input
            type="checkbox"
            checked={!!editing.open}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setEditing((prev) => ({ ...prev, open: e.currentTarget.checked }))
            }
          />
          開いている（open）
        </label>

        <label className="text-sm md:col-span-2">
          <span className="block text-gray-600 mb-1">画像URL</span>
          <input
            className="w-full border rounded px-3 py-2"
            placeholder="https://example.com/image.png"
            value={editing.imageUrl ?? ""}
            onChange={setField("imageUrl")}
          />
        </label>

        <label className="text-sm md:col-span-2">
          <span className="block text-gray-600 mb-1">備考</span>
          <textarea
            className="w-full border rounded px-3 py-2"
            rows={3}
            placeholder="メモ"
            value={editing.note ?? ""}
            onChange={setField("note")}
          />
        </label>
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleSave}
          className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
        >
          保存
        </button>
        <button
          onClick={resetForm}
          className="px-4 py-2 rounded bg-gray-200 text-gray-800 hover:bg-gray-300"
        >
          クリア
        </button>
      </div>

      {/* 一覧 */}
      <div className="mt-6 overflow-x-auto">
        <table className="w-full text-sm border border-gray-200 rounded">
          <thead className="bg-blue-50">
            <tr>
              <th className="px-3 py-2 text-left">ID</th>
              <th className="px-3 py-2 text-left">名称</th>
              <th className="px-3 py-2 text-left">住所</th>
              <th className="px-3 py-2 text-left">電話</th>
              <th className="px-3 py-2 text-left">混雑度</th>
              <th className="px-3 py-2 text-left">open</th>
              <th className="px-3 py-2" />
            </tr>
          </thead>
          <tbody>
            {sortedRows.map((r) => (
              <tr key={r.id} className="border-t">
                <td className="px-3 py-2">{r.id}</td>
                <td className="px-3 py-2">{r.name ?? "-"}</td>
                <td className="px-3 py-2">{r.address ?? "-"}</td>
                <td className="px-3 py-2">{r.phone ?? "-"}</td>
                <td className="px-3 py-2">{r.crowd_level ?? "-"}</td>
                <td className="px-3 py-2">{r.open ? "○" : "-"}</td>
                <td className="px-3 py-2 text-right">
                  <button
                    onClick={() => setEditing({ ...r })}
                    className="px-3 py-1.5 rounded bg-white border border-blue-200 text-blue-700 hover:bg-blue-50 mr-2"
                  >
                    編集
                  </button>
                  <button
                    onClick={() => handleDelete(r.id)}
                    className="px-3 py-1.5 rounded bg-red-500 text-white hover:bg-red-600"
                  >
                    削除
                  </button>
                </td>
              </tr>
            ))}
            {sortedRows.length === 0 && (
              <tr>
                <td className="px-3 py-6 text-center text-gray-500" colSpan={7}>
                  まだ登録がありません
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

/* =========================================================================
 *  お知らせセクション（下段）
 * ========================================================================= */
function NoticeSection() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  useEffect(() => {
    setNotices(loadNotices());
  }, []);

  const handleAdd = () => {
    if (!title.trim()) {
      alert("件名は必須です");
      return;
    }
    addNotice({ title: title.trim(), body });
    setNotices(loadNotices());
    setTitle("");
    setBody("");
  };

  const handleDelete = (id: string) => {
    if (!confirm("削除しますか？")) return;
    const next = notices.filter((n) => n.id !== id);
    setNotices(next);
    saveNotices(next);
  };

  return (
    <section
      className={`bg-white border ${CARD_BORDER} rounded-2xl shadow-sm p-5`}
    >
      <h2 className={`text-lg font-semibold mb-3 ${TITLE}`}>お知らせ</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
        <label className="text-sm">
          <span className="block text-gray-600 mb-1">件名</span>
          <input
            className="w-full border rounded px-3 py-2"
            placeholder="件名"
            value={title}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setTitle(e.currentTarget.value)
            }
          />
        </label>

        <label className="text-sm md:col-span-2">
          <span className="block text-gray-600 mb-1">本文</span>
          <textarea
            className="w-full border rounded px-3 py-2"
            rows={3}
            placeholder="本文"
            value={body}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
              setBody(e.currentTarget.value)
            }
          />
        </label>
      </div>

      <button
        onClick={handleAdd}
        className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
      >
        追加する
      </button>

      {/* 一覧 */}
      <div className="mt-6 space-y-3">
        {notices.map((n) => (
          <div
            key={n.id}
            className="border rounded-lg p-3 flex items-start justify-between"
          >
            <div>
              <div className="text-sm text-gray-500">
                {new Date(n.dateISO).toLocaleString()}
              </div>
              <div className="font-medium">{n.title}</div>
              {n.body && <div className="text-sm text-gray-700">{n.body}</div>}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleDelete(n.id)}
                className="px-3 py-1.5 rounded bg-red-500 text-white hover:bg-red-600"
              >
                削除
              </button>
            </div>
          </div>
        ))}
        {notices.length === 0 && (
          <div className="text-center text-gray-500 py-6">
            まだお知らせはありません
          </div>
        )}
      </div>
    </section>
  );
}
