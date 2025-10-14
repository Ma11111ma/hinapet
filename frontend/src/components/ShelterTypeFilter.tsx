"use client";

type Props = {
  selected: string | null;
  onSelect: (type: string | null) => void;
};

export default function ShelterTypeFilter({ selected, onSelect }: Props) {
  const toggleType = (type: string) => {
    if (selected === type) onSelect(null); //同じボタンを再クリックで解除
    else onSelect(type);
  };
  return (
    <div className="flex gap-2 mt-2">
      <button
        onClick={() => toggleType("accompany")}
        className={`px-4 py-2 rounded ${
          selected === "accompany"
            ? "bg-blue-600 text-white"
            : "bg-blue-100 text-blue-700"
        }`}
      >
        同行避難
      </button>
      <button
        onClick={() => toggleType("companion")}
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
