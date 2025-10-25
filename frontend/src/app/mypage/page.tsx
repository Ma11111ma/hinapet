"use client";

import { useState } from "react";
import UserInfoForm from "../../components/UserInfoForm";
import PetInfoPanel from "../../components/PetInfoPanel";

export default function MyPage() {
  const [activeTab, setActiveTab] = useState<"user" | "pet">("user");

  return (
    <div className="flex flex-col items-center w-full min-h-screen bg-amber-50 text-stone-800">
      {/* === タブヘッダー === */}
      <div className="flex w-full max-w-md justify-around border-b border-gray-300 bg-white sticky top-[56px] z-20">
        <button
          onClick={() => setActiveTab("user")}
          className={`flex-1 py-3 text-center font-medium ${
            activeTab === "user"
              ? "border-b-2 border-amber-600 text-amber-600"
              : "text-gray-500 hover:text-amber-600"
          }`}
        >
          ユーザー情報
        </button>

        <button
          onClick={() => setActiveTab("pet")}
          className={`flex-1 py-3 text-center font-medium ${
            activeTab === "pet"
              ? "border-b-2 border-amber-600 text-amber-600"
              : "text-gray-500 hover:text-amber-600"
          }`}
        >
          ペット情報
        </button>
      </div>

      {/* === 内容エリア === */}
      <div className="w-full max-w-md p-4 bg-white shadow-sm rounded-b-lg mt-2">
        {activeTab === "user" && <UserInfoForm />}
        {activeTab === "pet" && <PetInfoPanel />}
      </div>
    </div>
  );
}
