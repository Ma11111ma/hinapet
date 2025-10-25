"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import CryptoJS from "crypto-js";
import type { StorageValue } from "zustand/middleware";

/** ====== 型定義：フォーム項目 ====== **/
export type PetFormData = {
  photoUrl?: string; // 写真（任意）
  name: string; // 名前（必須）
  gender?: "女の子" | "男の子"; // 性別（選択）
  birthdate?: string; // 生年月日
  neutered?: "未" | "済"; // 去勢避妊
  species: "犬" | "猫" | "その他"; // 種別
  speciesOther?: string; // 種別が「その他」の場合の自由入力
  breed: string; // 品種
  vaccineCertUrl?: string; // ワクチン証明
  rabiesCertUrl?: string; // 狂犬病証明
  clinicName?: string; // かかりつけ病院
  history?: string; // 既往歴
  medication?: string; // 薬情報
  memo?: string; // 備考
};

/** ====== ペット項目（リスト用） ====== **/
export type PetItem = PetFormData & {
  id: string;
};

/** ====== 初期フォーム ====== **/
const initialForm: PetFormData = {
  name: "",
  species: "犬",
  breed: "",
};

/** ====== ストア型定義 ====== **/
type PetFormStore = {
  data: PetFormData;
  setField: <K extends keyof PetFormData>(k: K, v: PetFormData[K]) => void;
  resetForm: () => void;

  pets: PetItem[];
  addPet: (draft?: PetFormData) => PetItem;
  updatePet: (id: string, patch: Partial<PetFormData>) => void;
  removePet: (id: string) => void;

  _updatedAt: number | null;
};

/** ====== 暗号化付きストレージ ====== **/
const ENC_KEY = process.env.NEXT_PUBLIC_PETFORM_ENC_KEY ?? "dev-only-change-me";
const STORAGE_NAME = "pet-form-secure";
const DATA_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7日

const secureStorage = {
  getItem: (name: string): StorageValue<PetFormStore> | null => {
    try {
      const enc = localStorage.getItem(name);
      if (!enc) return null;

      const bytes = CryptoJS.AES.decrypt(enc, ENC_KEY);
      const json = bytes.toString(CryptoJS.enc.Utf8);
      if (!json) return null;

      const parsed = JSON.parse(json) as StorageValue<PetFormStore>;
      const updated = parsed?.state?._updatedAt ?? null;

      if (updated && Date.now() - updated > DATA_TTL_MS) {
        localStorage.removeItem(name);
        return null;
      }
      return parsed; // ← JSON.parseした結果（StorageValue型）を返す
    } catch {
      localStorage.removeItem(name);
      return null;
    }
  },

  setItem: (name: string, value: StorageValue<PetFormStore>): void => {
    try {
      // 暗号化前に更新時刻を埋め込む
      if (value?.state) value.state._updatedAt = Date.now();

      const json = JSON.stringify(value);
      const cipher = CryptoJS.AES.encrypt(json, ENC_KEY).toString();
      localStorage.setItem(name, cipher);
    } catch {
      // noop
    }
  },

  removeItem: (name: string): void => {
    localStorage.removeItem(name);
  },
};

/** ====== Zustand ストア（暗号化永続化） ====== **/
export const usePetFormStore = create<PetFormStore>()(
  persist(
    (set, get) => ({
      data: initialForm,
      setField: <K extends keyof PetFormData>(k: K, v: PetFormData[K]) =>
        set((s) => ({ data: { ...s.data, [k]: v } })),
      resetForm: () => set({ data: initialForm }),

      pets: [],
      addPet: (draft?: PetFormData) => {
        const id = crypto.randomUUID();
        const base: PetFormData = draft ?? get().data;
        const item: PetItem = { id, ...base };
        set((s) => ({
          pets: [item, ...s.pets],
          data: initialForm,
          _updatedAt: Date.now(),
        }));
        return item;
      },

      updatePet: (id: string, patch: Partial<PetFormData>) =>
        set((s) => ({
          pets: s.pets.map((p) => (p.id === id ? { ...p, ...patch } : p)),
          _updatedAt: Date.now(),
        })),

      removePet: (id: string) =>
        set((s) => ({
          pets: s.pets.filter((p) => p.id !== id),
          _updatedAt: Date.now(),
        })),

      _updatedAt: null,
    }),
    {
      name: STORAGE_NAME,
      storage: {
        getItem: secureStorage.getItem,
        setItem: secureStorage.setItem,
        removeItem: secureStorage.removeItem,
      },
      version: 2,

      migrate: async (persisted: unknown): Promise<PetFormStore> => {
        if (
          typeof persisted === "object" &&
          persisted !== null &&
          "state" in (persisted as Record<string, unknown>)
        ) {
          const state = (persisted as { state: PetFormStore }).state;
          return {
            ...state,
            pets: state.pets ?? [],
            data: state.data ?? initialForm,
            _updatedAt: state._updatedAt ?? null,
            setField: state.setField ?? (() => void 0),
            resetForm: state.resetForm ?? (() => void 0),
            addPet:
              state.addPet ??
              (() => ({ id: crypto.randomUUID(), ...initialForm })),
            updatePet: state.updatePet ?? (() => void 0),
            removePet: state.removePet ?? (() => void 0),
          };
        }

        // データ破損時は初期化
        return {
          data: initialForm,
          pets: [],
          setField: () => void 0,
          resetForm: () => void 0,
          addPet: () => ({ id: crypto.randomUUID(), ...initialForm }),
          updatePet: () => void 0,
          removePet: () => void 0,
          _updatedAt: null,
        };
      },
    }
  )
);
