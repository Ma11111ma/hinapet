"use client";
import MapView from "../../src/components/MapView";
import PremiumButton from "../components/PremiumButton";
import FooterAuthButtons from "../../src/components/FooterAuthButtons";
import Header from "../components/Header";
import FooterNav from "@/components/FooterNav";
import { useState } from "react";

export default function Page() {
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePremiumClick = async () => {
    try {
      setIsProcessing(true);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/premium/checkout`,
        {
          method: "POST",
          credentials: "include",
        }
      );
      if (!res.ok) throw new Error("Stripe checkout作成に失敗しました");
      const session = await res.json();
      if (session?.url) {
        window.location.href = session.url;
      } else {
        alert("決済ページを開けませんでした。");
      }
    } catch (err) {
      console.error(err);
      alert("決済ページを開けませんでした。");
    } finally {
      setIsProcessing(false);
    }
  };
  return (
    <div className="relative min-h-screen">
      {/* ✅ ヘッダー（固定表示） */}
      <Header />

      {/* ✅ メインコンテンツ */}
      <main className="pt-0 pb-24">
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
