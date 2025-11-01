// frontend/src/tests/unit/useDistanceMatrix.branches.spec.tsx
import { describe, test, expect, beforeEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useDistanceMatrix } from "@/hooks/useDistanceMatrix";

// ---- 型定義（any禁止） -------------------------------------------
type LatLng = { lat: number; lng: number };
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

type DMSInstance = {
  getDistanceMatrix: (
    req: DistanceMatrixRequest,
    cb: (res: DistanceMatrixResponse | null, status: MatrixStatus) => void
  ) => void;
};

type DMSCtor = new () => DMSInstance;

type GoogleWithDMS = {
  google: { maps: { DistanceMatrixService: DMSCtor } };
};

type GoogleMaybeDMS = {
  google?: { maps?: { DistanceMatrixService?: DMSCtor } };
};

// ---- ヘルパ（any禁止でグローバルへアクセス） ----------------------
const getCurrentCtor = (): DMSCtor | undefined => {
  return (
    (globalThis as unknown as GoogleMaybeDMS).google?.maps
      ?.DistanceMatrixService ?? undefined
  );
};

const setCurrentCtor = (ctor: DMSCtor): void => {
  (globalThis as unknown as GoogleWithDMS).google.maps.DistanceMatrixService =
    ctor;
};

// ---- テスト -------------------------------------------------------
describe("useDistanceMatrix extra branches", () => {
  beforeEach(() => {
    vi.useRealTimers();
  });

  test("ZERO_RESULTS: 要素ステータスが ZERO_RESULTS でも例外なく保存される（分岐網羅）", async () => {
    const original = getCurrentCtor();

    class ZeroResultsService implements DMSInstance {
      getDistanceMatrix(
        _req: DistanceMatrixRequest,
        cb: (res: DistanceMatrixResponse | null, status: MatrixStatus) => void
      ): void {
        const res: DistanceMatrixResponse = {
          rows: [
            {
              elements: [
                {
                  status: "ZERO_RESULTS",
                  distance: { text: "", value: 0 },
                  duration: { text: "", value: 0 },
                },
              ],
            },
          ],
        };
        cb(res, "OK");
      }
    }

    // 上書き
    setCurrentCtor(ZeroResultsService as unknown as DMSCtor);

    const { result } = renderHook(() => useDistanceMatrix());
    await act(async () => {
      await result.current.calculate({ lat: 35, lng: 139 }, [
        { id: "z1", lat: 35.02, lng: 139.02 },
      ]);
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.distances["z1"]).toBeDefined();
    expect(result.current.durations["z1"]).toBeDefined();

    // 元へ戻す
    if (original) setCurrentCtor(original);
  });

  test("NOT_FOUND: 複数要素で OK/NG 混在しても OK 側は保存、NG 側もフォールバックで安全終了", async () => {
    const original = getCurrentCtor();

    class MixedService implements DMSInstance {
      getDistanceMatrix(
        _req: DistanceMatrixRequest,
        cb: (res: DistanceMatrixResponse | null, status: MatrixStatus) => void
      ): void {
        const res: DistanceMatrixResponse = {
          rows: [
            {
              elements: [
                {
                  status: "OK",
                  distance: { text: "2.3 km", value: 2300 },
                  duration: { text: "18 mins", value: 1080 },
                },
                {
                  status: "NOT_FOUND",
                  distance: { text: "", value: 0 },
                  duration: { text: "", value: 0 },
                },
              ],
            },
          ],
        };
        cb(res, "OK");
      }
    }

    setCurrentCtor(MixedService as unknown as DMSCtor);

    const { result } = renderHook(() => useDistanceMatrix());
    await act(async () => {
      await result.current.calculate({ lat: 35, lng: 139 }, [
        { id: "ok", lat: 35.01, lng: 139.01 },
        { id: "ng", lat: 36.0, lng: 140.0 },
      ]);
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.distances["ok"]?.text).toBeTruthy();
    expect(result.current.durations["ok"]?.text).toBeTruthy();
    // NG側も実装のフォールバックで undefined にならない想定（最低限の到達確認）
    expect(result.current.distances["ng"]).toBeDefined();
    expect(result.current.durations["ng"]).toBeDefined();

    if (original) setCurrentCtor(original);
  });
});
