"use client";
// frontend/src/components/ShelterPin.tsx

export type ShelterKind = "accompany" | "companion";

/**
 * Google Maps Marker 用のカスタムピン画像を返す
 * - 同行避難: 青ピン（同行避難アイコン.png）
 * - 同伴避難: 緑ピン（同伴避難アイコン.png）
 */
export function getShelterPinSymbol(
  type: ShelterKind,
  isSelected = false
): google.maps.Icon | null {
  if (typeof window === "undefined" || !("google" in window)) {
    return null;
  }

  // 表示サイズを指定（選択時は拡大）
  const size = isSelected ? 58 : 46;

  // ピン画像URLを種別で切り替え
  const url =
    type === "accompany"
      ? "/pins/pin_accompany.png" // 同行避難ピン（青ベース）
      : "/pins/pin_companion.png"; // 同伴避難ピン（緑ベース）

  return {
    url,
    scaledSize: new google.maps.Size(size, size),
    anchor: new google.maps.Point(size / 2, size - 4), // ピン先端が地面を指す
    labelOrigin: new google.maps.Point(size / 2, size - 10),
  };
}
