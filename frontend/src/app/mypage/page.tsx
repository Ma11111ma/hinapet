// frontend/src/app/mypage/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/features/auth/AuthProvider";
import { useSearchParams } from "next/navigation";
import UserInfoForm from "../../components/UserInfoForm";
import PetInfoPanel from "../../components/PetInfoPanel";
import FooterNav from "@/components/FooterNav";
// ✅ 追加：ローカル管理のお知らせを読み書き
import { loadNotices, saveNotices } from "@/lib/localAdmin";

const HEADER = 56;
const FOOTER = 56;

/** 📰 お知らせ一覧（住民UI：/mypage に表示） */
function NoticeList() {
  const notices = loadNotices();
  const hasItems = notices.length > 0;

  const handleMarkAllRead = () => {
    saveNotices(
      notices.map((n) => ({
        ...n,
        read: true,
      }))
    );
    // 既読反映（🔔バッジ更新のため手軽にリロード）
    location.reload();
  };

  return (
    <div className="mt-6 bg-white border rounded-2xl p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-stone-800">お知らせ一覧</h3>
        {hasItems && (
          <button
            className="text-sm text-blue-600 underline"
            onClick={handleMarkAllRead}
          >
            すべて既読
          </button>
        )}
      </div>

      {!hasItems ? (
        <p className="text-sm text-stone-500">お知らせはありません</p>
      ) : (
        <ul className="space-y-2">
          {notices.map((n) => (
            <li key={n.id} className="border rounded p-3 bg-amber-50">
              <div className="text-xs text-stone-500">
                {new Date(n.dateISO).toLocaleString()}
              </div>
              <div className="font-medium">{n.title}</div>
              {n.body && (
                <p className="text-sm mt-1 whitespace-pre-wrap">{n.body}</p>
              )}
              {!n.read && (
                <span className="ml-2 inline-block text-xs text-white bg-amber-500 rounded px-2 py-[2px]">
                  未読
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

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
          {activeTab === "user" && (
            <>
              <UserInfoForm />
              {/* ✅ ユーザー情報のすぐ下に「お知らせ一覧」を表示 */}
              <NoticeList />
            </>
          )}
          {activeTab === "pet" && <PetInfoPanel />}
        </div>

        <div className="h-3" />
      </div>
    </div>
  );
}
