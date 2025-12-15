// frontend/src/tests/unit/useShelters.spec.ts
import { act, renderHook } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useShelters } from "@/hooks/useShelters";

describe("useShelters", () => {
  const originalEnv = process.env;

  // ── ここが重要：関数メソッドに確実に解決させるためのヘルパ ──
  const makeFetchSpy = () => vi.spyOn(globalThis, "fetch");
  const makeLogSpy = () => vi.spyOn(console, "log");
  const makeErrorSpy = () => vi.spyOn(console, "error");

  // 返り値型はヘルパ由来にする（アクセサの union を避ける）
  let fetchSpy: ReturnType<typeof makeFetchSpy>;
  let logSpy: ReturnType<typeof makeLogSpy>;
  let errorSpy: ReturnType<typeof makeErrorSpy>;

  beforeEach(() => {
    vi.restoreAllMocks();

    // ログを静音（必要なら外す）
    logSpy = makeLogSpy().mockImplementation(() => {});
    errorSpy = makeErrorSpy().mockImplementation(() => {});

    // APIベースURLを固定
    process.env = {
      ...originalEnv,
      NEXT_PUBLIC_API_BASE_URL: "http://api.test",
    };

    // fetch を関数メソッドとして spy 化（←ここが肝）
    fetchSpy = makeFetchSpy();
  });

  afterEach(() => {
    process.env = originalEnv;
    logSpy.mockRestore();
    errorSpy.mockRestore();
    fetchSpy.mockRestore();
  });

  it("正常: items配列で返る", async () => {
    fetchSpy.mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          items: [
            {
              id: "1",
              name: "A",
              address: "",
              type: "accompany",
              capacity: 10,
              lat: 0,
              lng: 0,
            },
          ],
        }),
        { status: 200 }
      )
    );

    const { result } = renderHook(() => useShelters());
    await act(async () => {
      await result.current.fetchShelters({
        keyword: "A",
        category: "accompany",
      });
    });

    expect(result.current.error).toBeNull();
    expect(result.current.shelters).toHaveLength(1);

    const lastCall = fetchSpy.mock.calls.at(-1);
    expect(lastCall?.[0]).toBe(
      "http://api.test/shelters?keyword=A&category=accompany"
    );
  });

  it("正常: 生配列でも受け付ける", async () => {
    fetchSpy.mockResolvedValueOnce(
      new Response(
        JSON.stringify([
          {
            id: "2",
            name: "B",
            address: "",
            type: "companion",
            capacity: 5,
            lat: 1,
            lng: 1,
          },
        ]),
        { status: 200 }
      )
    );

    const { result } = renderHook(() => useShelters());
    await act(async () => {
      await result.current.fetchShelters();
    });

    expect(result.current.error).toBeNull();
    expect(result.current.shelters).toHaveLength(1);

    const lastCall = fetchSpy.mock.calls.at(-1);
    expect(lastCall?.[0]).toBe("http://api.test/shelters");
  });

  it("境界: keyword 空白 → 付与されない / category 無効値 → 付与されない", async () => {
    fetchSpy.mockResolvedValueOnce(
      new Response(JSON.stringify({ items: [] }), { status: 200 })
    );

    const { result } = renderHook(() => useShelters());

    // union 外は unknown 経由で never に落とす
    const invalidCategory = "invalid" as unknown as never;

    await act(async () => {
      await result.current.fetchShelters({
        keyword: "   ",
        category: invalidCategory,
      });
    });

    const lastCall = fetchSpy.mock.calls.at(-1);
    expect(lastCall?.[0]).toBe("http://api.test/shelters");
    expect(result.current.shelters).toHaveLength(0);
  });

  it("異常: API エラー", async () => {
    fetchSpy.mockResolvedValueOnce(new Response("NG", { status: 500 }));

    const { result } = renderHook(() => useShelters());
    await act(async () => {
      await result.current.fetchShelters({ keyword: "X" });
    });

    expect(result.current.shelters).toHaveLength(0);
    expect(result.current.error).toContain("取得できませんでした");

    const lastCall = fetchSpy.mock.calls.at(-1);
    expect(lastCall?.[0]).toBe("http://api.test/shelters?keyword=X");
    expect(errorSpy).toHaveBeenCalled();
  });
});
