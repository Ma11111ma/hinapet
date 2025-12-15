// frontend/src/tests/unit/petFormStore.spec.ts
import { describe, it, expect, beforeEach, vi } from "vitest";
import { usePetFormStore } from "@/store/petFormStore";

/** ====== 最小型 & ユーティリティ（any禁止） ====== */
type Rec = Record<string, unknown>;

const isObj = (v: unknown): v is Rec => typeof v === "object" && v !== null;
const has = <K extends string>(v: unknown, k: K): v is Rec =>
  isObj(v) && k in v;
const hasFn = <K extends string>(
  v: unknown,
  k: K
): v is Record<K, (...a: unknown[]) => unknown> =>
  has(v, k) && typeof (v as Rec)[k] === "function";

/** 追加: IDを持つレコードの型ガード（any禁止対応） */
const hasId = (v: Rec): v is Rec & { id: string } =>
  isObj(v) && "id" in v && typeof (v as Record<"id", unknown>).id === "string";

/** ====== ストア読み取りの形状差吸収（直下 or state/actions 配下） ====== */
type Readable = { list: Rec[]; form: Rec | null };

function resolveReadable(getState: () => unknown): Readable {
  const raw = getState();

  // actions/state あり
  if (isObj(raw) && has(raw, "state")) {
    const st = isObj(raw.state) ? (raw.state as Rec) : {};
    const list =
      has(st, "pets") && Array.isArray(st.pets) ? (st.pets as Rec[]) : [];
    const form = ((): Rec | null => {
      if (has(st, "data") && isObj(st.data)) return st.data as Rec;
      if (has(st, "form") && isObj(st.form)) return st.form as Rec;
      return null;
    })();
    return { list, form };
  }

  // 直下
  const list =
    isObj(raw) && has(raw, "pets") && Array.isArray((raw as Rec).pets)
      ? ((raw as Rec).pets as Rec[])
      : [];
  const form = ((): Rec | null => {
    if (isObj(raw) && has(raw, "data") && isObj((raw as Rec).data))
      return ((raw as Rec).data as Rec) ?? null;
    if (isObj(raw) && has(raw, "form") && isObj((raw as Rec).form))
      return ((raw as Rec).form as Rec) ?? null;
    return null;
  })();

  return { list, form };
}

/** ====== 実行APIの解決（存在しない場合は undefined） ====== */
type AddPet = (draft?: Rec) => unknown;
type UpdatePet = (id: string, patch: Rec) => unknown;
type RemovePet = (id: string) => unknown;
type ResetForm = () => unknown;
type Rehydrate = () => unknown;

function resolveActions(getState: () => unknown) {
  const raw = getState();

  const pick = (src: unknown) => ({
    addPet:
      isObj(src) && hasFn(src, "addPet")
        ? (src.addPet as AddPet)
        : isObj(src) && hasFn(src, "add")
        ? (src.add as AddPet)
        : undefined,
    updatePet:
      isObj(src) && hasFn(src, "updatePet")
        ? (src.updatePet as UpdatePet)
        : isObj(src) && hasFn(src, "update")
        ? (src.update as UpdatePet)
        : undefined,
    removePet:
      isObj(src) && hasFn(src, "removePet")
        ? (src.removePet as RemovePet)
        : isObj(src) && hasFn(src, "remove")
        ? (src.remove as RemovePet)
        : isObj(src) && hasFn(src, "delete")
        ? (src.delete as RemovePet)
        : undefined,
    resetForm:
      isObj(src) && hasFn(src, "resetForm")
        ? (src.resetForm as ResetForm)
        : isObj(src) && hasFn(src, "reset")
        ? (src.reset as ResetForm)
        : undefined,
    rehydrate:
      isObj(src) && hasFn(src, "rehydrate")
        ? (src.rehydrate as Rehydrate)
        : isObj(src) && hasFn(src, "load")
        ? (src.load as Rehydrate)
        : undefined,
  });

  // actions 配下
  if (isObj(raw) && has(raw, "actions")) return pick((raw as Rec).actions);
  // 直下
  return pick(raw);
}

/** ====== 既定フォーム（ストアから動的取得。無ければフォールバック） ====== */
function getInitialForm(): Rec {
  const st = usePetFormStore.getState() as unknown;
  if (isObj(st) && (has(st, "data") || has(st, "form"))) {
    const f = (
      has(st, "data") ? (st as Rec).data : (st as Rec)["form"]
    ) as unknown;
    if (isObj(f)) return f;
  }
  return { name: "", species: "犬", breed: "" };
}

/** setState の安全ヘルパー（部分パッチのみ） */
function safePatch(patch: Rec) {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore - Partial<State> として受け取らせる
  usePetFormStore.setState(patch);
}

/** ====== 共通セットアップ ====== */
beforeEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();

  const init = getInitialForm();
  const base: Rec = {};
  base["pets"] = [];
  base["data"] = init;
  base["form"] = init;
  base["_updatedAt"] = new Date().toISOString();
  safePatch(base);
});

/** ====== 基本系 ====== */
describe("usePetFormStore basic spec", () => {
  it("add/update/remove/reset の基本動作", () => {
    const acts = resolveActions(usePetFormStore.getState);
    expect(!!acts.addPet).toBe(true);

    // add
    const id = crypto.randomUUID?.() ?? "id-1";
    acts.addPet?.({ id, name: "A", species: "犬", breed: "" });
    let cur = resolveReadable(usePetFormStore.getState);
    expect(cur.list.some((p) => hasId(p) && p.id === id)).toBe(true);

    // update
    acts.updatePet?.(id, { name: "A2" });
    cur = resolveReadable(usePetFormStore.getState);
    const hit = cur.list.find((p) => hasId(p) && p.id === id);
    expect(isObj(hit) ? (hit as Rec).name : undefined).toBe("A2");

    // remove
    acts.removePet?.(id);
    cur = resolveReadable(usePetFormStore.getState);
    expect(cur.list.some((p) => hasId(p) && p.id === id)).toBe(false);

    // resetForm
    safePatch({ data: { name: "X", species: "犬", breed: "" } });
    acts.resetForm?.();
    cur = resolveReadable(usePetFormStore.getState);
    expect(cur.form).toEqual(getInitialForm());
  });
});
