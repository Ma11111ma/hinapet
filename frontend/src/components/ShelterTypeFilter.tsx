"use client";
import type { ShelterType } from "../types/shelter";

type Props = {
  selected: ShelterType | null;
  onSelect: (type: ShelterType | null) => void;
};

export default function ShelterTypeFilter({ selected, onSelect }: Props) {
  const toggle = (t: ShelterType) => onSelect(selected === t ? null : t);

  return (
    <div className="flex gap-2 mt-2">
      <button
        onClick={() => toggle("accompany")}
        className={`px-4 py-2 rounded ${
          selected === "accompany"
            ? "bg-blue-600 text-white"
            : "bg-blue-100 text-blue-700"
        }`}
      >
        同行避難
      </button>
      <button
        onClick={() => toggle("companion")}
        className={`px-4 py-2 rounded ${
          selected === "companion"
            ? "bg-green-600 text-white"
            : "bg-green-100 text-green-700"
        }`}
      >
        同伴避難
      </button>
    </div>
  );
}
