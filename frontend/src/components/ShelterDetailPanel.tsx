"use client";
import { useEffect, useState } from "react";
import type { Shelter } from "../types/shelter";
import { FavoriteButton } from "./FavoriteButton";
import { useAuth } from "@/features/auth/AuthProvider";

type Props = {
  shelter: Shelter;
  onClose: () => void;
  onRoute: (dest: google.maps.LatLngLiteral) => void;
  distance?: string | null;
  duration?: string | null;
};

export default function ShelterDetailPanel({
  shelter,
  onClose,
  onRoute,
  distance,
  duration,
}: Props) {
  const { user } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

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

  // 背景スクロール停止（モバイル時のみ）
  useEffect(() => {
    if (isMobile) document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isMobile]);

  // ==== PCレイアウト（右サイド固定） ====
  if (!isMobile) {
    return (
      <div className="fixed top-16 right-0 h-[calc(100vh-4rem)] w-96 bg-white shadow-2xl border-l border-gray-200 z-40 p-6 overflow-y-auto">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-bold">{shelter.name}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800"
          >
            ✕
          </button>
        </div>
        <p className="text-gray-700 text-sm mb-1">住所：{shelter.address}</p>
        <p className="text-gray-700 text-sm mb-1">
          区分：{shelter.type === "accompany" ? "同行避難" : "同伴避難"}
        </p>
        <p className="text-gray-700 text-sm mb-1">
          混雑度：{crowdLabelMap[shelter.crowd_level ?? "full"]}
        </p>
        <p className="text-gray-700 text-sm mb-1">距離：{distance}</p>
        <p className="text-gray-700 text-sm mb-4">所要時間：約 {duration}</p>

        <div className="flex justify-between mb-3">
          <button
            onClick={() => onRoute({ lat: shelter.lat, lng: shelter.lng })}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            ここに行く
          </button>
          <button
            disabled={!user?.is_premium}
            onClick={() =>
              user?.is_premium
                ? alert(`${shelter.name} を避難完了にしました`)
                : alert("この機能はプレミアムユーザー限定です。")
            }
            className={`px-4 py-2 rounded-md ${
              user?.is_premium
                ? "bg-orange-500 text-white hover:bg-orange-600"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            避難完了
          </button>
        </div>

        <FavoriteButton shelterId={shelter.id} />
      </div>
    );
  }

  // ==== モバイルレイアウト（ボトムシート） ====
  return (
    <div
      className={`fixed inset-0 z-40 flex justify-center items-end bg-black/30 transition-all ${
        isExpanded ? "backdrop-blur-[2px]" : ""
      }`}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`bg-white w-full max-w-md rounded-t-2xl shadow-xl p-6 transition-transform duration-300 ${
          isExpanded ? "translate-y-0" : "translate-y-[40%]"
        }`}
        onTouchStart={() => setIsExpanded(true)}
      >
        <div
          className="w-12 h-1.5 bg-gray-400 rounded-full mx-auto mb-3 cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        ></div>

        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-bold">{shelter.name}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800"
          >
            ✕
          </button>
        </div>

        <p className="text-gray-700 text-sm">住所：{shelter.address}</p>
        <p className="text-gray-700 text-sm">
          区分：{shelter.type === "accompany" ? "同行避難" : "同伴避難"}
        </p>
        <p className="text-gray-700 text-sm">
          混雑度：{crowdLabelMap[shelter.crowd_level ?? "full"]}
        </p>
        <p className="text-gray-700 text-sm">距離：約 {distance}</p>
        <p className="text-gray-700 text-sm mb-4">所要時間：約 {duration}</p>

        <div className="flex justify-between mb-3">
          <button
            onClick={() => onRoute({ lat: shelter.lat, lng: shelter.lng })}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            ここに行く
          </button>
          <button
            disabled={!user?.is_premium}
            onClick={() =>
              user?.is_premium
                ? alert(`${shelter.name} を避難完了にしました`)
                : alert("この機能はプレミアムユーザー限定です。")
            }
            className={`px-4 py-2 rounded-md ${
              user?.is_premium
                ? "bg-orange-500 text-white hover:bg-orange-600"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            避難完了
          </button>
        </div>

        <FavoriteButton shelterId={shelter.id} />
      </div>
    </div>
  );
}
