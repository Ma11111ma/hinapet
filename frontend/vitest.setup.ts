// vitest.setup.ts
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

// RTLの後片付け
afterEach(() => cleanup());

// ==== 最小タイプ定義（anyを使わない） ====
type TravelMode = "DRIVING" | "WALKING" | "BICYCLING" | "TRANSIT";

interface LatLng {
  lat: number;
  lng: number;
}

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

// ==== モック実装 ====
class MockDistanceMatrixService {
  getDistanceMatrix(
    _req: DistanceMatrixRequest,
    callback: (res: DistanceMatrixResponse, status: MatrixStatus) => void
  ): void {
    const res: DistanceMatrixResponse = {
      rows: [
        {
          elements: [
            {
              distance: { text: "0.5 km", value: 500 },
              duration: { text: "6 mins", value: 360 },
              status: "OK",
            },
          ],
        },
      ],
    };
    callback(res, "OK");
  }
}

const mockGoogle = {
  maps: {
    DistanceMatrixService: MockDistanceMatrixService,
    TravelMode: { DRIVING: "DRIVING" as TravelMode },
  },
};

// globalThis に google を定義（上書き可能）
Object.defineProperty(globalThis, "google", {
  value: mockGoogle,
  writable: true,
  configurable: true,
});

// 一部の実装が window.google を参照する場合に備えてミラー
if (typeof window !== "undefined") {
  (window as unknown as { google: typeof mockGoogle }).google = mockGoogle;
}
