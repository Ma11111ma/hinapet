"use client";

import { useState } from "react";

type UseCurrentPositionReturn = {
  position: { lat: number; lng: number } | null;
  error: string | null;
  getPosition: () => void;
};

export const useCurrentPosition = (): UseCurrentPositionReturn => {
  // 現在地（緯度・経度）を保存
  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(
    null
  );

  const [error, setError] = useState<string | null>(null);

  const getPosition = () => {
    if (!navigator.geolocation) {
      setError("このブラウザでは位置情報取得がサポートされていません");
      return;
    }
    // 位置情報を取得
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        // 緯度と経度を使いやすい形に整形
        const coords = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
        setPosition(coords); // state更新（位置情報セット）
        setError(null); // エラーリセット
      },
      (err) => {
        // エラーごとにメッセージ分岐
        if (err.code === 1) {
          setError("位置情報の取得が拒否されました。");
        } else if (err.code === 2) {
          setError("位置情報を取得できませんでした。");
        } else if (err.code === 3) {
          setError("位置情報の取得がタイムアウトしました。");
        } else {
          setError("位置情報の取得中に予期せぬエラーが発生しました。");
        }
      }
    );
  };

  // 返り値（他のコンポーネントで使う値）
  return { position, error, getPosition };
};
