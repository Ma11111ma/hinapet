// frontend/src/store/petFormStore.ts
"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import CryptoJS from "crypto-js";
import type { PersistStorage, StorageValue } from "zustand/middleware";

/** ====== 型定義：フォーム項目 ====== **/
export type PetFormData = {
  photoUrl?: string; // 写真（任意）
  name: string; // 名前（必須）
  gender?: "女の子" | "男の子"; // 性別（選択）
  birthdate?: string; // 生年月日（YYYY-MM-DD など）
  neutered?: "未" | "済"; // 去勢避妊（任意・選択）
  species: "犬" | "猫" | "その他"; // 動物の種類（必須・選択）
  speciesOther?: string; // その他自由記述
  breed: string; // 種別（必須）※DBは後で必須化予定
  vaccineCertUrl?: string; // ワクチン証明（犬なら必須）
  rabiesCertUrl?: string; // 狂犬病証明（犬なら必須）
  clinicName?: string; // かかりつけ動物病院
  history?: string; // 既往歴
  medication?: string; // 飲んでる薬
  memo?: string; // 備考
};

/** ====== ストアの形 ====== **/
type PetFormStore = {
  data: PetFormData;
  setField: <K extends keyof PetFormData>(
    key: K,
    value: PetFormData[K]
  ) => void;
  reset: () => void;
  // 有効期限（TTL）管理のために時刻を保持
  _updatedAt: number | null;
};

/** ====== 暗号化ストレージ実装 ======
 * localStorage に保存するJSONを AES で暗号化します。
 * 復号に失敗したら null を返し、ストレージ破損を自動復旧します。
 */
const ENC_KEY = process.env.NEXT_PUBLIC_PETFORM_ENC_KEY ?? "dev-only-change-me";

const STORAGE_NAME = "pet-form-secure"; // localStorage のキー
const DATA_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7日で期限切れ（任意）

const secureStorage: PersistStorage<PetFormStore> = {
  getItem: (name): StorageValue<PetFormStore> | null => {
    try {
      const enc = localStorage.getItem(name);
      if (!enc) return null;

      const bytes = CryptoJS.AES.decrypt(enc, ENC_KEY);
      const json = bytes.toString(CryptoJS.enc.Utf8);
      if (!json) return null;

      // TTL チェック（期限切れなら破棄）
      const parsed = JSON.parse(json) as StorageValue<PetFormStore>;
      const updated = parsed?.state?._updatedAt ?? null;
      if (updated && Date.now() - updated > DATA_TTL_MS) {
        localStorage.removeItem(name);
        return null;
      }
      return parsed;
    } catch {
      // 破損時は消して再生成
      localStorage.removeItem(name);
      return null;
    }
  },

  setItem: (name, value): void => {
    try {
      if (typeof value === "object" && "state" in value && value.state) {
        value.state._updatedAt = Date.now();
      }
      const json = JSON.stringify(value);
      const cipher = CryptoJS.AES.encrypt(json, ENC_KEY).toString();
      localStorage.setItem(name, cipher);
    } catch {
      // セーフティ：失敗時は何もしない
    }
  },
  removeItem: (name): void => {
    localStorage.removeItem(name);
  },
};

/** ====== 初期値 ====== **/
const initialData: PetFormData = {
  name: "",
  species: "犬",
  breed: "",
};

/** ====== Zustand ストア（暗号化永続化） ====== **/
export const usePetFormStore = create<PetFormStore>()(
  persist(
    (set) => ({
      data: initialData,
      setField: (key, value) =>
        set((state) => ({
          data: { ...state.data, [key]: value },
          _updatedAt: Date.now(),
        })),
      reset: () => set({ data: initialData, _updatedAt: null }),
      _updatedAt: null,
    }),
    {
      name: STORAGE_NAME,
      storage: secureStorage,
      // バージョン管理と破壊的変更時の移行
      version: 1,
      migrate: async (
        persistedState: unknown,
        _version: number
      ): Promise<PetFormStore> => {
        // 破壊的変更があったらここで変換
        return persistedState as PetFormStore;
      },
      // （重要）デバッグ時でも state を console に出さない
      // serialize/deserialize はデフォルト(JSON)のままにして暗号化層に委ねます
    }
  )
);
