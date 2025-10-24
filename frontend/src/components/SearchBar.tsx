"use client";

import { useState, ChangeEvent } from "react";
import { FaSearch, FaMapMarkerAlt } from "react-icons/fa";

type Props = {
  onSearch: (keyword: string) => void;
  onClear: () => void;
};

export default function SearchBar({ onSearch, onClear }: Props) {
  const [keyword, setKeyword] = useState("");

  const handleSearch = () => onSearch(keyword);
  const handleClear = () => {
    setKeyword("");
    onClear();
  };

  return (
    <div className="flex items-center w-[92%] max-w-md mx-auto bg-white rounded-full shadow-md px-3 py-2 border border-gray-200">
      {/* 📍 現在地アイコン（Google風） */}
      <button
        onClick={handleClear}
        className="p-2 text-blue-500 hover:text-blue-700"
        title="現在地を再取得"
      >
        <FaMapMarkerAlt className="w-4 h-4" />
      </button>

      {/* 🔍 検索入力 */}
      <input
        type="text"
        placeholder="避難所を検索"
        value={keyword}
        onChange={(e: ChangeEvent<HTMLInputElement>) =>
          setKeyword(e.target.value)
        }
        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        className="flex-1 bg-transparent px-2 text-gray-700 placeholder-gray-400 focus:outline-none"
      />

      {/* 🔍 検索ボタン */}
      <button
        onClick={handleSearch}
        className="p-2 text-gray-500 hover:text-gray-700"
        title="検索"
      >
        <FaSearch className="w-4 h-4" />
      </button>
    </div>
  );
}
