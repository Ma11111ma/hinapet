"use client";
import type { ShelterType } from "../types/shelter";

type Props = {
  selected: ShelterType | null;
  onSelect: (type: ShelterType | null) => void;
  onLayout?: (type: ShelterType, rect: DOMRect) => void;
  highlightTarget?: ShelterType | null;
};

export default function ShelterTypeFilter({
  selected,
  onSelect,
  highlightTarget,
}: Props) {
  const toggle = (t: ShelterType) => onSelect(selected === t ? null : t);

  // 実際に強調表示する対象（チュートリアル中優先）
  const active = highlightTarget ?? selected;
  return (
    <div className="flex justify-center gap-3 mt-2">
      {/* 🔵 同行避難 */}
      <button
        // 👇 チュートリアル用クラス名を追加（既存デザインはそのまま）
        className={`filter-btn-accompany px-3 py-1.5 rounded-full border text-sm font-medium transition ${
          selected === "accompany"
            ? "bg-blue-600 text-white border-blue-600"
            : "bg-white text-blue-600 border-blue-400 hover:bg-blue-50"
        }`}
        onClick={() => toggle("accompany")}
      >
        ● 同行避難所
      </button>

      {/* 🟢 同伴避難 */}
      <button
        // 👇 同伴避難用クラス名を追加
        className={`filter-btn-companion px-3 py-1.5 rounded-full border text-sm font-medium transition ${
          selected === "companion"
            ? "bg-green-600 text-white border-green-600"
            : "bg-white text-green-600 border-green-400 hover:bg-green-50"
        }`}
        onClick={() => toggle("companion")}
      >
        ● 同伴避難所
      </button>
    </div>
  );
}
