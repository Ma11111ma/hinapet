// frontend/src/tests/unit/useFavorites.spec.ts
import { renderHook, act, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import type { User, Auth, GoogleAuthProvider } from "firebase/auth";

// ─────────────────────────────────────────────
// 共有モック状態（テストごとに書き換える）
// ─────────────────────────────────────────────
let mockCurrentUser: User | null = {
  getIdToken: vi.fn().mockResolvedValue("token-123"),
} as unknown as User;

// ─────────────────────────────────────────────
// 1) AuthProvider を完全モック（useAuth を直返し）
// ─────────────────────────────────────────────
vi.mock("@/features/auth/AuthProvider", () => {
  return {
    useAuth: () => ({
      user: mockCurrentUser,
      isAuthenticated: !!mockCurrentUser,
    }),
  };
});

// ─────────────────────────────────────────────
// 2) firebase/auth の getIdToken を部分モック
// ─────────────────────────────────────────────
vi.mock("firebase/auth", async () => {
  const actual = await vi.importActual<typeof import("firebase/auth")>(
    "firebase/auth"
  );
  return {
    ...actual,
    getIdToken: async (user: User | null, _force?: boolean) =>
      user ? "token-123" : null,
  };
});

// ─────────────────────────────────────────────
// 3) firebaseClient も完全モック（実初期化を遮断）
// ─────────────────────────────────────────────
vi.mock("@/lib/firebaseClient", () => {
  const fakeAuth = {} as unknown as Auth;
  Object.defineProperty(fakeAuth, "currentUser", {
    configurable: true,
    get: () => mockCurrentUser,
  });

  const fakeGoogleProvider = {} as GoogleAuthProvider;

  return {
    auth: fakeAuth,
    googleProvider: fakeGoogleProvider,
    getIdToken: async (user: User | null) => (user ? "token-123" : null),
  } as unknown as typeof import("@/lib/firebaseClient");
});

// ─────────────────────────────────────────────
// 4) 被テストのフック（モック適用後に import）
// ─────────────────────────────────────────────
import { useFavorites } from "@/hooks/useFavorites";

describe("useFavorites", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    mockCurrentUser = {
      getIdToken: vi.fn().mockResolvedValue("token-123"),
    } as unknown as User;
  });

  it("初期取得: items → shelter_id 配列", async () => {
    // どの呼び出しでも同じ成功レスポンスを返す（内部で複数回呼ばれてもOK）
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({ items: [{ shelter_id: "s1" }, { shelter_id: "s2" }] }),
        { status: 200 }
      )
    );

    const { result } = renderHook(() => useFavorites());

    // loading の代わりに favorites が埋まるまで待つ
    await waitFor(() => {
      expect(result.current.favorites).toEqual(["s1", "s2"]);
    });
  });

  it("追加: PUT 成功で state に反映", async () => {
    vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ items: [] }), { status: 200 })
      ) // 初期一覧
      .mockResolvedValueOnce(new Response(null, { status: 200 })); // PUT

    const { result } = renderHook(() => useFavorites());
    await waitFor(() => !result.current.loading);

    await act(async () => {
      await result.current.addFavorite("s100");
    });
    expect(result.current.favorites).toEqual(["s100"]);
  });

  it("削除: DELETE 成功で state から除外", async () => {
    vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            items: [{ shelter_id: "s1" }, { shelter_id: "s2" }],
          }),
          { status: 200 }
        )
      ) // 初期一覧
      .mockResolvedValueOnce(new Response(null, { status: 200 })); // DELETE

    const { result } = renderHook(() => useFavorites());
    await waitFor(() => !result.current.loading);

    await act(async () => {
      await result.current.removeFavorite("s2");
    });
    expect(result.current.favorites).toEqual(["s1"]);
  });

  it("異常: 一覧取得 401/500 でも落ちない", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response("err", { status: 500 })
    );

    const { result } = renderHook(() => useFavorites());
    await waitFor(() => !result.current.loading);
    expect(result.current.favorites).toEqual([]);
  });

  it("異常: 未ログイン（auth.currentUser=null）→ 何もしない", async () => {
    mockCurrentUser = null; // useAuth と auth.currentUser 両方未ログインに

    const spy = vi.spyOn(globalThis, "fetch");
    const { result } = renderHook(() => useFavorites());
    await waitFor(() => !result.current.loading);
    expect(spy).not.toHaveBeenCalled();

    // 後続テストへの影響を戻す
    mockCurrentUser = {
      getIdToken: vi.fn().mockResolvedValue("token-123"),
    } as unknown as User;
  });
});
