// frontend/src/tests/unit/useCurrentPosition.spec.ts
import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { useCurrentPosition } from "@/hooks/useCurrentPosition";

// コールバックの型を明示
type GeoSuccess = (pos: GeolocationPosition) => void;
type GeoError = (err: GeolocationPositionError) => void;

describe("useCurrentPosition", () => {
  // ✅ Vitest の vi.fn は「関数シグネチャ型」をジェネリクスに取る
  const mockGetCurrentPosition =
    vi.fn<
      (success: GeoSuccess, error?: GeoError, options?: PositionOptions) => void
    >();

  beforeEach(() => {
    vi.restoreAllMocks();
    mockGetCurrentPosition.mockReset();

    // window.navigator.geolocation をモック
    Object.defineProperty(global.navigator, "geolocation", {
      value: {
        getCurrentPosition: mockGetCurrentPosition,
      },
      configurable: true,
    });
  });

  it("正常: 位置情報が取得できる", () => {
    const { result } = renderHook(() => useCurrentPosition());

    // 最小限のダミー GeolocationPosition
    const fakePosition = {
      coords: {
        latitude: 35.0,
        longitude: 139.0,
        accuracy: 10,
        altitude: null,
        altitudeAccuracy: null,
        heading: null,
        speed: null,
      },
      timestamp: Date.now(),
    } as unknown as GeolocationPosition;

    mockGetCurrentPosition.mockImplementation((success) => {
      success(fakePosition);
    });

    act(() => {
      result.current.getPosition();
    });

    expect(result.current.error).toBeNull();
    expect(result.current.position).toEqual({ lat: 35.0, lng: 139.0 });
  });

  it("異常: 取得が拒否された", () => {
    const { result } = renderHook(() => useCurrentPosition());

    const err: GeolocationPositionError = {
      code: 1,
      message: "Permission denied",
      PERMISSION_DENIED: 1,
      POSITION_UNAVAILABLE: 2,
      TIMEOUT: 3,
    } as GeolocationPositionError;

    mockGetCurrentPosition.mockImplementation(
      (_s: GeoSuccess, error?: GeoError) => {
        error?.(err);
      }
    );

    act(() => {
      result.current.getPosition();
    });

    expect(result.current.position).toBeNull();
    expect(result.current.error).toContain("拒否");
  });

  it("異常: 位置情報を取得できない", () => {
    const { result } = renderHook(() => useCurrentPosition());

    const err: GeolocationPositionError = {
      code: 2,
      message: "Unavailable",
      PERMISSION_DENIED: 1,
      POSITION_UNAVAILABLE: 2,
      TIMEOUT: 3,
    } as GeolocationPositionError;

    mockGetCurrentPosition.mockImplementation(
      (_s: GeoSuccess, error?: GeoError) => {
        error?.(err);
      }
    );

    act(() => {
      result.current.getPosition();
    });

    expect(result.current.position).toBeNull();
    expect(result.current.error).toContain("取得できません");
  });

  it("異常: タイムアウト", () => {
    const { result } = renderHook(() => useCurrentPosition());

    const err: GeolocationPositionError = {
      code: 3,
      message: "Timeout",
      PERMISSION_DENIED: 1,
      POSITION_UNAVAILABLE: 2,
      TIMEOUT: 3,
    } as GeolocationPositionError;

    mockGetCurrentPosition.mockImplementation(
      (_s: GeoSuccess, error?: GeoError) => {
        error?.(err);
      }
    );

    act(() => {
      result.current.getPosition();
    });

    expect(result.current.position).toBeNull();
    expect(result.current.error).toContain("タイムアウト");
  });

  it("未対応ブラウザ: エラーメッセージ", () => {
    // geolocation 未対応にする
    Object.defineProperty(global.navigator, "geolocation", {
      value: undefined,
      configurable: true,
    });

    const { result } = renderHook(() => useCurrentPosition());
    act(() => {
      result.current.getPosition();
    });

    expect(result.current.error).toContain("サポートされていません");
  });
});
