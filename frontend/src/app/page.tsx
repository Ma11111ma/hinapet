"use client";
import MapView from "../../src/components/MapView";
import PremiumButton from "../components/PremiumButton";
import FooterAuthButtons from "../../src/components/FooterAuthButtons";
import Header from "../components/Header";
import FooterNav from "@/components/FooterNav";

export default function Page() {
  return (
    <div className="relative min-h-screen bg-gray-50">
      {/* ✅ ヘッダー（固定表示） */}
      <Header />

      {/* ✅ メインコンテンツ */}
      <main className="pt-14 pb-24 px-4">
        <h1 className="text-xl font-semibold mb-4">避難所マップ</h1>

        {/* 地図 */}
        <div className="mb-6">
          <MapView />
        </div>

        {/* プレミアム紹介セクション */}
        <section className="mt-8 bg-white rounded-xl shadow p-4">
          <h2 className="text-lg font-bold mb-2">プレミアム機能</h2>
          <p className="text-sm text-gray-700 mb-3">
            プレミアムに登録すると追加機能が利用できます。
          </p>
          <PremiumButton onUnauthedNavigateTo="/login" />
        </section>

        {/* 認証ボタン（ログイン/ログアウト） */}
        <div className="mt-8">
          <FooterAuthButtons />
        </div>
      </main>

      {/* ✅ フッターナビ（固定表示） */}
      <FooterNav />
    </div>
  );
}
