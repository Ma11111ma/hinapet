// frontend/src/lib/localAdmin.ts
"use client";

/**
 * ==========================================================
 *  管理者が localStorage に保存するデータ構造
 *  - Notice（お知らせ）
 *  - ShelterPatch（避難所情報パッチ）
 * ==========================================================
 */

/* ---------- 型定義 ---------- */

export type Notice = {
  id: string;
  title: string;
  body: string;
  dateISO: string; // 例: "2025-10-27T09:00:00.000Z"
  read?: boolean; // 住民側で既読にする
};

export type ShelterPatch = {
  id: string; // APIのshelter.idと合わせる

  // 🩵 管理者画面で使う項目をすべて定義
  name?: string; // 避難所名
  address?: string; // 住所
  phone?: string; // 電話番号
  crowd_level?: "empty" | "few" | "full"; // 混雑度
  open?: boolean; // 開閉状態
  imageUrl?: string; // 画像URL
  note?: string; // 備考
};

/* ---------- localStorage キー ---------- */
const K_NOTICE = "admin-notices";
const K_SHELTER = "shelter-patches";

/* ==========================================================
 * お知らせ関連
 * ========================================================== */

/** すべて読み込み */
export function loadNotices(): Notice[] {
  try {
    return JSON.parse(localStorage.getItem(K_NOTICE) || "[]");
  } catch {
    return [];
  }
}

/** 保存して storage イベントを発火 */
export function saveNotices(list: Notice[]) {
  localStorage.setItem(K_NOTICE, JSON.stringify(list));
  // 他タブへ伝える
  window.dispatchEvent(new StorageEvent("storage", { key: K_NOTICE }));
}

/** 1件追加 */
export function addNotice(n: Omit<Notice, "id" | "dateISO" | "read">) {
  const list = loadNotices();
  const item: Notice = {
    id: crypto.randomUUID(),
    title: n.title,
    body: n.body,
    dateISO: new Date().toISOString(),
    read: false,
  };
  saveNotices([item, ...list]);
}

/** 未読件数 */
export function unreadCount(): number {
  return loadNotices().filter((n) => !n.read).length;
}

/** すべて既読にする */
export function markAllRead() {
  const list = loadNotices().map((n) => ({ ...n, read: true }));
  saveNotices(list);
}

/* ==========================================================
 * 避難所パッチ関連
 * ========================================================== */

/** 全件読み込み */
export function loadShelterPatches(): ShelterPatch[] {
  try {
    return JSON.parse(localStorage.getItem(K_SHELTER) || "[]");
  } catch {
    return [];
  }
}

/** 保存して storage イベントを発火 */
export function saveShelterPatches(list: ShelterPatch[]) {
  localStorage.setItem(K_SHELTER, JSON.stringify(list));
  window.dispatchEvent(new StorageEvent("storage", { key: K_SHELTER }));
}

/** 追加 or 更新 */
export function upsertShelterPatch(patch: ShelterPatch) {
  const list = loadShelterPatches();
  const idx = list.findIndex((p) => p.id === patch.id);
  if (idx >= 0) list[idx] = { ...list[idx], ...patch };
  else list.unshift(patch);
  saveShelterPatches(list);
}

/** 指定IDを削除 */
export function removeShelterPatch(id: string) {
  const filtered = loadShelterPatches().filter((p) => p.id !== id);
  saveShelterPatches(filtered);
}
