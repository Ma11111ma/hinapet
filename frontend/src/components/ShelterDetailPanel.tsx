"use client";
import { useEffect, useState } from "react";
import type { Shelter } from "../types/shelter";
import { FavoriteButton } from "./FavoriteButton";
import { useAuth } from "@/features/auth/AuthProvider";

type Props = {
  shelter: Shelter;
  onClose: () => void;
  onRoute?: (dest: google.maps.LatLngLiteral) => void;
  distance?: string | null;
  duration?: string | null;
  nearbyShelters?: Shelter[];
};

export default function ShelterDetailPanel({
  shelter,
  onClose,
  onRoute,
  distance,
  duration,
  nearbyShelters = [],
}: Props) {
  const { user } = useAuth();
  const [isMobile, setIsMobile] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const crowdLabelMap: Record<string, string> = {
    empty: "空きあり",
    few: "残りわずか",
    full: "満員",
  };
  // ✅ フェードイン用
  useEffect(() => {
    setTimeout(() => setIsVisible(true), 20);
  }, []);

  // モバイル時スクロールロック
  useEffect(() => {
    if (isMobile) document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isMobile]);

  // ==== PCレイアウト ====
  if (!isMobile) {
    return (
      <div className="fixed bottom-[80px] right-0 w-[420px] bg-white shadow-2xl border border-gray-200 z-40 rounded-2xl p-5 mr-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-bold text-gray-800">{shelter.name}</h2>
          <div className="flex items-center gap-3">
            <FavoriteButton shelterId={shelter.id} />
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-800 text-lg"
            >
              ✕
            </button>
          </div>
        </div>

        {/* 詳細情報 */}
        <div className="text-sm text-gray-700 space-y-1">
          <p>住所：{shelter.address}</p>
          <p>区分：{shelter.type === "accompany" ? "同行避難" : "同伴避難"}</p>
          <p>混雑度：{crowdLabelMap[shelter.crowd_level ?? "full"]}</p>
          <p>距離：約 {distance}</p>
          <p>所要時間：約 {duration}</p>
        </div>

        {/* 避難完了ボタン */}
        <div className="flex justify-end mt-4">
          <button
            disabled={!user?.is_premium}
            onClick={() =>
              user?.is_premium
                ? alert(`${shelter.name} を避難完了にしました`)
                : alert("この機能はプレミアムユーザー限定です。")
            }
            className={`px-4 py-2 rounded-md text-sm ${
              user?.is_premium
                ? "bg-orange-500 text-white hover:bg-orange-600"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            避難完了
          </button>
        </div>

        {/* 周辺避難所リスト */}
        {nearbyShelters.length > 0 && (
          <div className="mt-5 border-t pt-3">
            <h3 className="font-semibold text-gray-800 mb-2 text-sm">
              周辺の避難所（距離順）
            </h3>
            <ul className="divide-y divide-gray-200">
              {nearbyShelters.map((s) => (
                <li
                  key={s.id}
                  className="py-2 cursor-pointer hover:bg-gray-50 px-1 rounded-md transition"
                >
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{s.name}</span>
                    <span>
                      {s.type === "accompany" ? "同行" : "同伴"}／
                      {crowdLabelMap[s.crowd_level ?? "full"]}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  }

  // ==== モバイルレイアウト ====
  return (
    // 背景レイヤー（閉じる用）
    <div
      className={`fixed inset-0 z-40 flex justify-center items-end transition-all duration-300 ease-out ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
      onClick={onClose}
    >
      {/* 白いパネル本体 */}
      <div
        onClick={(e) => e.stopPropagation()}
        className={`bg-white w-full max-w-md rounded-t-2xl shadow-xl transition-all duration-500 ease-in-out ${
          isExpanded ? "h-[65vh]" : "h-[35vh]"
        }`}
        style={{
          position: "absolute",
          bottom: 56, // ✅ フッターの高さに合わせて固定（被らない）
        }}
        onTouchStart={() => setIsExpanded(true)}
      >
        {/* スワイプバー */}
        <div
          className="w-12 h-1.5 bg-gray-400 rounded-full mx-auto my-2 cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        ></div>

        {/* Header */}
        <div className="flex justify-between items-center mb-3 px-6">
          <h2 className="text-lg font-bold text-gray-800">{shelter.name}</h2>
          <div className="flex items-center gap-3">
            <FavoriteButton shelterId={shelter.id} />
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-800 text-lg"
            >
              ✕
            </button>
          </div>
        </div>

        {/* 詳細情報 */}
        <div className="text-sm text-gray-700 space-y-1 px-6 overflow-y-auto h-[calc(100%-6rem)]">
          <p>住所：{shelter.address}</p>
          <p>区分：{shelter.type === "accompany" ? "同行避難" : "同伴避難"}</p>
          <p>混雑度：{crowdLabelMap[shelter.crowd_level ?? "full"]}</p>
          <p>距離：約 {distance}</p>
          <p>所要時間：約 {duration}</p>

          {/* 避難完了ボタン */}
          <div className="flex justify-end mt-4">
            <button
              disabled={!user?.is_premium}
              onClick={() =>
                user?.is_premium
                  ? alert(`${shelter.name} を避難完了にしました`)
                  : alert("この機能はプレミアムユーザー限定です。")
              }
              className={`px-4 py-2 rounded-md text-sm ${
                user?.is_premium
                  ? "bg-orange-500 text-white hover:bg-orange-600"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              避難完了
            </button>
          </div>

          {/* 周辺避難所リスト */}
          {nearbyShelters.length > 0 && (
            <div className="mt-5 border-t pt-3">
              <h3 className="font-semibold text-gray-800 mb-2 text-sm">
                周辺の避難所（距離順）
              </h3>
              <ul className="divide-y divide-gray-200">
                {nearbyShelters.map((s) => (
                  <li
                    key={s.id}
                    className="py-2 cursor-pointer hover:bg-gray-50 px-1 rounded-md transition"
                  >
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{s.name}</span>
                      <span>
                        {s.type === "accompany" ? "同行" : "同伴"}／
                        {crowdLabelMap[s.crowd_level ?? "full"]}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
