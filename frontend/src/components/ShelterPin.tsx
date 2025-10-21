"use client";
// frontend/src/components/ShelterPin.tsx

export type ShelterKind = "accompany" | "companion";

/**
 * Google Maps Marker 用のシンボル（SVGパス）を返す。
 * - type に応じて色を統一
 * - isSelected なら少し大きく
 */
export function getShelterPinSymbol(
  type: ShelterKind,
  isSelected = false
): google.maps.Symbol {
  const fillColor = type === "accompany" ? "#1D4ED8" : "#16A34A"; // 青/緑
  const scale = isSelected ? 1.1 : 1.0;

  // マップピンっぽいパス（円でもOKですが視認性重視でピン型）
  const path =
    "M12 2C8.134 2 5 5.134 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.866-3.134-7-7-7zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z";

  return {
    path,
    fillColor,
    fillOpacity: 1,
    strokeColor: "#ffffff",
    strokeWeight: 2,
    scale, // 1.0 基準（path の座標系に依存）
    anchor: new google.maps.Point(12, 24), // 底辺が地面を指すよう調整
  };
}
