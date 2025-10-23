"use client";
import MapView from "../../src/components/MapView";
import Header from "../components/Header";
import FooterNav from "@/components/FooterNav";
import { useState } from "react";

export default function Page() {
  const [isProcessing, setIsProcessing] = useState(false);

  // ✅ Stripe Checkout 決済関数（UIには表示しない）
  const handlePremiumCheckout = async () => {
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
        window.location.href = session.url; // Stripe決済画面へ
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
    <div className="relative w-full h-screen overflow-hidden">
      {/* ✅ 固定ヘッダー */}
      <Header />

      {/* ✅ 地図（ヘッダーとフッターの間に固定） */}
      <div className="absolute top-[56px] bottom-[56px] left-0 right-0">
        <MapView />
      </div>

      {/* ✅ 固定フッター */}
      <FooterNav />
    </div>
  );
}
