"use client";

import Header from "@/components/Header";
import FooterNav from "@/components/FooterNav";
import MapView from "@/components/MapView";

export default function Page() {
  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* ✅ 固定ヘッダー */}
      <Header />

      {/* ✅ 全面地図（固定表示） */}
      <div className="absolute top-[56px] bottom-[56px] left-0 right-0">
        <MapView />
      </div>

      {/* ✅ 固定フッター */}
      <FooterNav />
    </div>
  );
}
