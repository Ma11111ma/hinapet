"use client";

import { useState } from "react";
import MyPage from "./MyPage";
import PetPage from "./PetPage";

export default function ProfileTabsPage() {
  const [activeTab, setActiveTab] = useState<"my" | "pet">("my");

  return (
    <div className="max-w-3xl mx-auto mt-10 p-4">
      <div className="flex border-b mb-4">
        <button
          className={`px-4 py-2 -mb-px border-b-2 font-semibold ${
            activeTab === "my" ? "border-blue-500 text-blue-500" : "border-transparent text-gray-500"
          }`}
          onClick={() => setActiveTab("my")}
        >
          マイページ
        </button>
        <button
          className={`px-4 py-2 -mb-px border-b-2 font-semibold ${
            activeTab === "pet" ? "border-blue-500 text-blue-500" : "border-transparent text-gray-500"
          }`}
          onClick={() => setActiveTab("pet")}
        >
          ペット用マイページ
        </button>
      </div>

      <div>
        {activeTab === "my" && <MyPage />}
        {activeTab === "pet" && <PetPage />}
      </div>
    </div>
  );
}
