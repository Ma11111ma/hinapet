"use client";
import { useEffect } from "react";
import React from "react";
import type { Shelter } from "../types/shelter";
import { FavoriteButton } from "./FavoriteButton";
import { useAuth } from "@/features/auth/AuthProvider";

type Props = {
  shelter: Shelter;
  onClose: () => void;
  onRoute: (dest: google.maps.LatLngLiteral) => void;
  distance?: string | null;
  duration?: string | null;
  nearbyShelters?: Shelter[];
};

export default function ShelterModal({
  shelter,
  onClose,
  onRoute,
  distance,
  duration,
  nearbyShelters = [],
}: Props) {
  const { user } = useAuth();

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

  const handleEvacuateComplete = () => {
    if (!user?.is_premium) {
      alert("この機能はプレミアムユーザー限定です。");
      return;
    }
    alert(`${shelter.name} に避難完了として登録しました`);
  };
  return (
    <div
      className="bg-white rounded-lg p-2 text-sm"
      onClick={(e) => e.stopPropagation()}
    >
      {/* タイトルとお気に入りボタン */}
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-lg font-bold">{shelter.name}</h2>
        <FavoriteButton
          shelterId={shelter.id}
          className="ml-2 hover:scale-105 transition-transform"
          ariaLabelAdd="お気に入り登録"
          ariaLabelRemove="お気に入り解除"
        />
      </div>

      {/* 基本情報 */}
      <p className="text-gray-700 mb-2">住所：{shelter.address}</p>
      <p className="text-gray-700 mb-2">
        避難区分：{shelter.type === "accompany" ? "同行避難" : "同伴避難"}
      </p>
      <p className="text-gray-700 mb-2">収容人数：{shelter.capacity}</p>

      {/* 距離・混雑度 */}
      {distance && duration && (
        <div className="mt-3 bg-gray-100 p-2 rounded">
          <p className="text-sm">距離：{distance}</p>
          <p className="text-sm">所要時間：約 {duration}</p>
          <p className="text-sm">
            混雑度：{crowdLabelMap[shelter.crowd_level ?? "full"]}
          </p>
        </div>
      )}

      {/* 操作ボタン */}
      <div className="mt-6 flex flex-col gap-2">
        <div className="flex justify-between">
          <button
            onClick={() => onRoute({ lat: shelter.lat, lng: shelter.lng })}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            ここに行く
          </button>

          <button
            onClick={handleEvacuateComplete}
            className={`px-4 py-2 rounded-md transition-colors ${
              user?.is_premium
                ? "bg-orange-500 text-white hover:bg-orange-600"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            避難完了
          </button>
        </div>

        {/* 🔽 ボタン直下にメッセージを表示 */}
        {!user?.is_premium && (
          <p className="text-gray-700 text-sm text-right">
            この機能はプレミアムユーザー限定です。
          </p>
        )}
      </div>

      {/* 下部：周辺避難所リスト */}
      {nearbyShelters.length > 0 && (
        <div className="mt-6 border-t pt-4">
          <h3 className="text-md font-semibold mb-3">周辺の避難所</h3>
          <ul className="space-y-3 max-h-60 overflow-y-auto">
            {nearbyShelters.map((s) => (
              <li
                key={s.id}
                className="border rounded-md p-3 shadow-sm bg-gray-50"
              >
                <p className="font-medium">{s.name}</p>
                <p className="text-xs text-gray-600">{s.address}</p>
                <p className="text-xs text-gray-600">
                  混雑度：{crowdLabelMap[s.crowd_level ?? "full"]}
                </p>

                <div className="flex justify-end gap-2 mt-2">
                  <button
                    onClick={() => onRoute({ lat: s.lat, lng: s.lng })}
                    className="px-3 py-1 text-sm bg-blue-400 text-white rounded"
                  >
                    ここに行く
                  </button>
                  <button
                    onClick={() => {
                      if (!user?.is_premium) {
                        alert("この機能はプレミアムユーザー限定です。");
                        return;
                      }
                      alert(`${s.name} を避難完了にしました`);
                    }}
                    className={`px-3 py-1 text-sm rounded ${
                      user?.is_premium
                        ? "bg-orange-500 text-white"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    避難完了
                  </button>
                </div>

                {/* 周辺リストにも限定メッセージ表示 */}
                {!user?.is_premium && (
                  <p className="text-gray-700 text-xs mt-2 text-right">
                    この機能はプレミアムユーザー限定です。
                  </p>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 閉じるボタン */}
      <div className="mt-6 flex justify-end">
        <button
          onClick={onClose}
          className="px-5 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
        >
          閉じる
        </button>
      </div>
    </div>
  );
}
