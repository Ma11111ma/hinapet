"use client";
import FooterNav from "@/components/FooterNav";
import MapView from "@/components/MapView";

export default function Page() {
  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* ✅ 全面地図：ヘッダーとフッターを除いた完全フィット */}
      <div className="absolute top-[56px] bottom-[56px] left-0 right-0 z-0">
        <MapView />
      </div>

      {/* ✅ 固定フッター */}
      <FooterNav />
    </div>
  );
}
