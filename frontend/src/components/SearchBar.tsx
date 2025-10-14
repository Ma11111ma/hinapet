"use client";

import { useState, ChangeEvent } from "react";

type Props = {
  onSearch: (keyword: string) => void;
};

export default function SearchBar({ onSearch }: Props) {
  const [keyword, setKeyword] = useState("");

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setKeyword(e.target.value);
  };

  const handleSearch = () => {
    onSearch(keyword.trim());
  };
  const handleClear = () => {
    setKeyword("");
    onSearch("");
  };

  return (
    <div className="flex gap-2 p-2 bg-white rounded-lg shadow-mg">
      <input
        type="text"
        value={keyword}
        onChange={handleChange}
        placeholder="避難所を検索"
        className="border p-2 rounded w-48"
      />

      <button
        onClick={handleSearch}
        className="bg-blue-500 text-white px-4 rounded hover:bg-blue-600"
      >
        検索
      </button>
      <button
        onClick={handleClear}
        className="bg-gray-200 px-3 rounded hover:bg-gray-300"
      >
        クリア
      </button>
    </div>
  );
}
