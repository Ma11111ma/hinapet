"use client";

import { useState, ChangeEvent } from "react";

type Props = {
  onSearch: (params: { keyword: string; category: string }) => void;
};

export default function SearchBar({ onSearch }: Props) {
  const [keyword, setKeyword] = useState("");
  const [category, setCategory] = useState("");

  const handleKeywordChange = (e: ChangeEvent<HTMLInputElement>) =>
    setKeyword(e.target.value);
  const handleCategoryChange = (e: ChangeEvent<HTMLSelectElement>) =>
    setCategory(e.target.value);

  const handleSearchClick = () => {
    onSearch({ keyword, category });
  };

  const handleClear = () => {
    setKeyword("");
    setCategory("");
    onSearch({ keyword: "", category: "" });
  };

  return (
    <div className="flex gap-2 p-2 bg-white rounded-lg shadow-mg">
      <input
        type="text"
        value={keyword}
        onChange={handleKeywordChange}
        placeholder="避難所を検索"
        className="border p-2 rounded w-48"
      />
      <select
        value={category}
        onChange={handleCategoryChange}
        className="border p-2 rounded"
      >
        <option value="">すべてのカテゴリ</option>
        <option value="companion">同伴避難</option>
        <option value="accompany">同行避難</option>
      </select>
      <button
        onClick={handleSearchClick}
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
