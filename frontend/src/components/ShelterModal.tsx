"use client";
import { useEffect } from "react";
import React from "react";
import type { Shelter } from "../types/shelter";

type Props = {
  shelter: Shelter;
  onClose: () => void;
  onRoute: (dest: google.maps.LatLngLiteral) => void;
  distance?: string | null;
  duration?: string | null;
};

export default function ShelterModal({
  shelter,
  onClose,
  onRoute,
  distance,
  duration,
}: Props) {
  const crowdLabelMap: Record<string, string> = {
    empty: "空きあり",
    few: "残りわずか",
    full: "満員",
  };

  //ESCキーでモーダル閉じる
  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === "Esc") {
        e.preventDefault();
        onClose();
      }
    };
    //背景スクロールを無効化
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeydown);

    //クリーンアップ(イベント解除＋スクロール復帰)
    return () => {
      window.removeEventListener("keydown", handleKeydown);
      document.body.style.overflow = prevOverflow || "auto";
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 bg-black/50 flex justify-center item-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-sl font-bold mb-4">{shelter.name}</h2>
        <p className="text-gray-700 mb-2">住所：{shelter.address}</p>
        <p className="text-gray-700 mb-2">
          避難区分：{shelter.type === "accompany" ? "同行避難" : "同伴避難"}
        </p>
        <p className="text-gray-700 mb-2">収容人数：{shelter.capacity}</p>

        {distance && duration && (
          <div className="mt-3 bg-gray-100 p-2 rounded">
            <p className="text-sm">距離：{distance}</p>
            <p className="text-sm">所要時間：約 {duration}</p>
            <p className="text-sm">
              混雑度：
              {shelter.crowd_level === "empty" && "空きあり"}
              {shelter.crowd_level === "few" && "残りわずか"}
              {shelter.crowd_level === "full" && "満員"}
            </p>
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
}
