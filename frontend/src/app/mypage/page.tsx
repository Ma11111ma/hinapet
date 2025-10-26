"use client";

import { useState } from "react";
import UserInfoForm from "../../components/UserInfoForm";
import PetInfoPanel from "../../components/PetInfoPanel";
import FooterNav from "@/components/FooterNav";

// ヘッダー/フッターの高さ（px）
const HEADER = 56;
const FOOTER = 56;

export default function MyPage() {
  const [activeTab, setActiveTab] = useState<"user" | "pet">("user");

  return (
    <div className="relative w-screen">
      {/* ▼ ヘッダーは layout.tsx 側の <Header />（固定）を使用 */}

      {/* ▼ スクロール可能なページ本体：ヘッダー〜フッターの間を占有 */}
      <div
        className="fixed left-0 right-0 overflow-y-auto bg-amber-50 text-stone-800"
        style={{ top: HEADER, bottom: FOOTER }}
      >
        {/* タブヘッダー（スクロール領域の中に配置。上部に常に見せたいなら sticky） */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200">
          <div className="mx-auto max-w-md flex">
            <button
              onClick={() => setActiveTab("user")}
              className={`flex-1 py-3 font-medium ${
                activeTab === "user"
                  ? "border-b-2 border-amber-600 text-amber-600"
                  : "text-gray-500 hover:text-amber-600"
              }`}
            >
              ユーザー情報
            </button>
            <button
              onClick={() => setActiveTab("pet")}
              className={`flex-1 py-3 font-medium ${
                activeTab === "pet"
                  ? "border-b-2 border-amber-600 text-amber-600"
                  : "text-gray-500 hover:text-amber-600"
              }`}
            >
              ペット情報
            </button>
          </div>
        </div>

        {/* コンテンツ */}
        <div className="mx-auto max-w-md p-4">
          {activeTab === "user" && <UserInfoForm />}
          {activeTab === "pet" && <PetInfoPanel />}
        </div>

        {/* スクロール末尾でフッターに飲み込まれないように余白を少し */}
        <div className="h-3" />
      </div>

      {/* ▼ 固定フッター */}
      <FooterNav />
    </div>
  );
}
