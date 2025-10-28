"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/features/auth/AuthProvider";
import { useSearchParams } from "next/navigation";
import UserInfoForm from "../../components/UserInfoForm";
import PetInfoPanel from "../../components/PetInfoPanel";
import FooterNav from "@/components/FooterNav";

const HEADER = 56;
const FOOTER = 56;

export default function MyPage() {
  const { user, initialized } = useAuth();
  const searchParams = useSearchParams();

  // 🔍 URLパラメータから初期タブを決定
  const initialTab = searchParams.get("tab") === "pet" ? "pet" : "user";
  const [activeTab, setActiveTab] = useState<"user" | "pet">(initialTab);

  // URLが変わったときにタブを再設定（例: /mypage?tab=pet）
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "pet" || tab === "user") {
      setActiveTab(tab);
    }
  }, [searchParams]);

  // 🔹未ログイン時のメッセージ
  if (initialized && !user) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-center text-stone-700 bg-amber-50">
        <h2 className="text-lg font-semibold mb-2">
          マイページのご利用にはログインが必要です
        </h2>
        <p className="text-sm text-stone-500">
          ログインすると、ユーザー情報やペット情報の登録ができます。
        </p>
        <FooterNav />
      </div>
    );
  }

  // 🔹ログイン済み時の通常表示
  return (
    <div className="relative w-screen">
      <div
        className="fixed left-0 right-0 overflow-y-auto bg-amber-50 text-stone-800"
        style={{ top: HEADER, bottom: FOOTER }}
      >
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

        <div className="mx-auto max-w-md p-4">
          {activeTab === "user" && <UserInfoForm />}
          {activeTab === "pet" && <PetInfoPanel />}
        </div>

        <div className="h-3" />
      </div>
    </div>
  );
}
