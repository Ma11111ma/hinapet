"use client";

import { useState } from "react";
import { FaSearch, FaMapMarkerAlt } from "react-icons/fa";

type Props = {
  onSearch: (keyword: string) => void;
  onClear?: () => void;
};

export default function SearchBar({ onSearch, onClear }: Props) {
  const [keyword, setKeyword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (keyword.trim()) onSearch(keyword.trim());
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="
        relative flex items-center justify-between
        bg-white shadow-md rounded-full
        px-4 py-2
        w-[90%] sm:w-[420px]
        max-w-[420px]
        transition
      "
      style={{ minWidth: "280px" }}
    >
      {/* ピンマーク */}
      <FaMapMarkerAlt className="text-blue-500 text-lg mr-2 flex-shrink-0" />

      {/* 入力欄 */}
      <input
        type="text"
        placeholder="避難所を検索"
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        className="
          flex-grow bg-transparent outline-none text-stone-800 placeholder-stone-400
          text-sm sm:text-base
        "
      />

      {/* クリアボタン */}
      {keyword && (
        <button
          type="button"
          onClick={() => {
            setKeyword("");
            onClear?.();
          }}
          className="text-stone-400 hover:text-stone-600 text-sm mr-2 flex-shrink-0"
        >
          ✕
        </button>
      )}

      {/* 検索ボタン */}
      <button
        type="submit"
        aria-label="検索"
        className="text-stone-600 hover:text-amber-600 flex-shrink-0"
      >
        <FaSearch className="text-lg" />
      </button>
    </form>
  );
}
