"use client";
import FooterNav from "@/components/FooterNav";
import MapView from "@/components/MapView";

export default function Page() {
  return (
    <div className="relative w-full h-screen">
      {/* ✅ 地図を全画面に固定表示（最背面） */}
      <div className="fixed inset-0 z-0">
        <MapView />
      </div>

      {/* ✅ フッターは地図の上にオーバーレイ */}
      <div className="fixed bottom-0 left-0 right-0 z-50">
        <FooterNav />
      </div>
    </div>
  );
}
