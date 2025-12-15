// frontend/src/tests/unit/useDistanceMatrix.spec.tsx
import { describe, test, expect, beforeEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useDistanceMatrix } from "@/hooks/useDistanceMatrix";

// 依存の最小型（any禁止）
type LatLng = { lat: number; lng: number };

// 追加の最小型（異常系テストで使う）
type TravelMode = "DRIVING" | "WALKING" | "BICYCLING" | "TRANSIT";

interface DistanceMatrixRequest {
  origins: LatLng[];
  destinations: LatLng[];
  travelMode?: TravelMode;
}

interface TextValue {
  text: string;
  value: number;
}

interface DistanceMatrixElement {
  distance: TextValue;
  duration: TextValue;
  status: "OK" | "ZERO_RESULTS" | "NOT_FOUND";
}

interface DistanceMatrixResponse {
  rows: Array<{ elements: DistanceMatrixElement[] }>;
}

type MatrixStatus = "OK" | "ERROR";

// --- テストごとにタイマーを初期化 ---
beforeEach(() => {
  vi.useRealTimers();
});

describe("useDistanceMatrix", () => {
  test("正常系: 距離と時間を保存できる", async () => {
    const { result } = renderHook(() => useDistanceMatrix());

    const origin: LatLng = { lat: 35.0, lng: 139.0 };
    const shelters = [{ id: "s1", lat: 35.01, lng: 139.01 }];

    await act(async () => {
      result.current.calculate(origin, shelters);
    });

    // vitest.setup.ts のモックが 0.5km / 6 mins を返す
    expect(result.current.loading).toBe(false);
    expect(result.current.distances["s1"]?.text).toBe("0.5 km");
    expect(result.current.durations["s1"]?.text).toBe("6 mins");
  });

  test("異常系: sheltersが空なら何もしない", async () => {
    const { result } = renderHook(() => useDistanceMatrix());
    const origin: LatLng = { lat: 35.0, lng: 139.0 };

    await act(async () => {
      result.current.calculate(origin, []); // 空配列
    });

    expect(Object.keys(result.current.distances).length).toBe(0);
    expect(Object.keys(result.current.durations).length).toBe(0);
  });

  test("異常系: Google が 'ERROR' を返しても例外なく安全に終了（モック値で補填）", async () => {
    // 既存の DistanceMatrixService を退避
    const originalService = (
      globalThis as unknown as {
        google?: {
          maps?: {
            DistanceMatrixService?: new () => {
              getDistanceMatrix: (
                req: DistanceMatrixRequest,
                cb: (
                  res: DistanceMatrixResponse | null,
                  status: MatrixStatus
                ) => void
              ) => void;
            };
          };
        };
      }
    ).google?.maps?.DistanceMatrixService;

    // status: "ERROR" を返す悪いサービス
    class BadService {
      getDistanceMatrix(
        _req: DistanceMatrixRequest,
        cb: (res: DistanceMatrixResponse | null, status: MatrixStatus) => void
      ): void {
        cb(null, "ERROR");
      }
    }

    // 上書き
    (
      globalThis as unknown as {
        google: {
          maps: {
            DistanceMatrixService: new () => {
              getDistanceMatrix: (
                req: DistanceMatrixRequest,
                cb: (
                  res: DistanceMatrixResponse | null,
                  status: MatrixStatus
                ) => void
              ) => void;
            };
          };
        };
      }
    ).google.maps.DistanceMatrixService = BadService;

    try {
      const { result } = renderHook(() => useDistanceMatrix());
      await act(async () => {
        result.current.calculate({ lat: 35, lng: 139 }, [
          { id: "1", lat: 35.1, lng: 139.1, name: "X" },
        ]);
      });

      // フォールバックで loading は解除される
      expect(result.current.loading).toBe(false);

      // 値が埋まっていることだけ確認（具体値は実装依存）
      expect(result.current.distances["1"]).toBeDefined();
      expect(result.current.durations["1"]).toBeDefined();
      expect(result.current.distances["1"]?.text).toBeTruthy();
      expect(result.current.durations["1"]?.text).toBeTruthy();
    } finally {
      // 元のサービスへ戻す
      if (originalService) {
        (
          globalThis as unknown as {
            google: {
              maps: {
                DistanceMatrixService: new () => {
                  getDistanceMatrix: (
                    req: DistanceMatrixRequest,
                    cb: (
                      res: DistanceMatrixResponse | null,
                      status: MatrixStatus
                    ) => void
                  ) => void;
                };
              };
            };
          }
        ).google.maps.DistanceMatrixService = originalService;
      }
    }
  });

  test("分岐網羅: window.google が未定義でも早期 return（例外なし）", async () => {
    // 退避
    const saved = (globalThis as unknown as { google?: unknown }).google;
    // 未定義化
    delete (globalThis as unknown as { google?: unknown }).google;

    const { result } = renderHook(() => useDistanceMatrix());
    await act(async () => {
      result.current.calculate({ lat: 35, lng: 139 }, [
        { id: "X", lat: 35.1, lng: 139.1, name: "NoGoogle" },
      ]);
    });

    // 何も起きない（例外なし・保存なし）
    expect(Object.keys(result.current.distances).length).toBe(0);
    expect(Object.keys(result.current.durations).length).toBe(0);

    // 復元
    (globalThis as unknown as { google?: unknown }).google = saved;
  });

  test("分岐網羅: loading 中は連続呼び出しを無視（ガード）", async () => {
    vi.useFakeTimers();

    // 既存の DistanceMatrixService を退避
    const originalService = (
      globalThis as unknown as {
        google?: {
          maps?: {
            DistanceMatrixService?: new () => {
              getDistanceMatrix: (
                req: DistanceMatrixRequest,
                cb: (
                  res: DistanceMatrixResponse | null,
                  status: MatrixStatus
                ) => void
              ) => void;
            };
          };
        };
      }
    ).google?.maps?.DistanceMatrixService;

    // 呼び出し回数を数える遅延サービス
    class DelayService {
      static calls = 0;
      getDistanceMatrix(
        _req: DistanceMatrixRequest,
        cb: (res: DistanceMatrixResponse, status: MatrixStatus) => void
      ): void {
        DelayService.calls += 1;
        // 200ms 後に成功コールバック
        setTimeout(() => {
          const res: DistanceMatrixResponse = {
            rows: [
              {
                elements: [
                  {
                    distance: { text: "1.0 km", value: 1000 },
                    duration: { text: "12 mins", value: 720 },
                    status: "OK",
                  },
                ],
              },
            ],
          };
          cb(res, "OK");
        }, 200);
      }
    }

    // 上書き
    (
      globalThis as unknown as {
        google: {
          maps: {
            DistanceMatrixService: new () => {
              getDistanceMatrix: (
                req: DistanceMatrixRequest,
                cb: (
                  res: DistanceMatrixResponse | null,
                  status: MatrixStatus
                ) => void
              ) => void;
            };
          };
        };
      }
    ).google.maps.DistanceMatrixService = DelayService;

    try {
      const { result } = renderHook(() => useDistanceMatrix());
      const origin: LatLng = { lat: 35, lng: 139 };
      const shelters = [{ id: "S", lat: 35.1, lng: 139.1 }];

      // 1回目開始（loading=true になる）
      await act(async () => {
        result.current.calculate(origin, shelters);
      });

      // loading 中にもう一度叩く → 無視されるはず
      await act(async () => {
        result.current.calculate(origin, shelters);
      });

      // ここまででサービス呼び出しは 1 回のまま
      expect(DelayService.calls).toBe(1);

      // タイマー前進と React 更新を act で包む
      await act(async () => {
        vi.advanceTimersByTime(250); // 200ms より少し多め
      });
      // マイクロタスクをフラッシュ（状態反映を待つ）
      await Promise.resolve();

      // 完了後、距離が入っている
      expect(result.current.loading).toBe(false);
      expect(result.current.distances["S"]?.text).toBe("1.0 km");
      expect(result.current.durations["S"]?.text).toBe("12 mins");
    } finally {
      // 復元
      if (originalService) {
        (
          globalThis as unknown as {
            google: {
              maps: {
                DistanceMatrixService: new () => {
                  getDistanceMatrix: (
                    req: DistanceMatrixRequest,
                    cb: (
                      res: DistanceMatrixResponse | null,
                      status: MatrixStatus
                    ) => void
                  ) => void;
                };
              };
            };
          }
        ).google.maps.DistanceMatrixService = originalService;
      }
      vi.useRealTimers();
    }
  });
});
