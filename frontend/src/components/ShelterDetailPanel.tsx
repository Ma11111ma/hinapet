// frontend/src/components/ShelterDetailPanel.tsx
"use client";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import type { Shelter } from "../types/shelter";
import { FavoriteButton } from "./FavoriteButton";
import { useAuth } from "@/features/auth/AuthProvider";
import { getAuth } from "firebase/auth";

type Props = {
  shelter: Shelter;
  onClose: () => void;
  distance?: string | null;
  duration?: string | null;
  nearbyShelters?: Shelter[];
};

export default function ShelterDetailPanel({
  shelter,
  onClose,
  distance,
  duration,
  nearbyShelters = [],
}: Props) {
  const { user } = useAuth();
  const [isMobile, setIsMobile] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);

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

  // フェードイン
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

  // 🟢 モーダル（常に最前面）
  const premiumModal = showPremiumModal
    ? createPortal(
        <div
          className="fixed inset-0 bg-black/40 z-[9999] flex items-center justify-center"
          onClick={() => setShowPremiumModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-xl p-6 w-80 text-center animate-fade-in"
          >
            <h3 className="text-lg font-bold mb-2">プレミアム機能のご案内</h3>
            <p className="text-sm text-gray-600 mb-4">
              プレミアム登録で「避難完了」などの機能が利用できるようになります。
            </p>
            <button
              onClick={async () => {
                try {
                  const auth = getAuth();
                  const user = auth.currentUser;

                  // 未ログインならログインへ誘導
                  if (!user) {
                    window.location.href = "/login";
                    return;
                  }

                  // FirebaseのIDトークンを取得
                  const idToken = await user.getIdToken(true);

                  // Stripe Checkoutのエンドポイント呼び出し
                  const res = await fetch(
                    `${process.env.NEXT_PUBLIC_API_BASE_URL}/premium/checkout`,
                    {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${idToken}`,
                      },
                      body: JSON.stringify({}),
                    }
                  );

                  if (!res.ok) {
                    if (res.status === 401 || res.status === 403) {
                      alert(
                        "ログインセッションが切れています。再ログインしてください。"
                      );
                      window.location.href = "/login";
                      return;
                    }
                    const body = await res.text();
                    throw new Error(`${res.status} ${res.statusText} ${body}`);
                  }

                  // Checkout URLを受け取りStripeへ遷移
                  const data = await res.json();
                  if (!data.url)
                    throw new Error("サーバからURLが返却されませんでした。");
                  window.location.href = data.url;
                } catch (err) {
                  console.error(err);
                  alert("決済ページを開けませんでした。");
                }
              }}
              className="w-full bg-orange-500 text-white py-2 rounded-md hover:bg-orange-600 transition"
            >
              プレミアム登録へ進む
            </button>
            <button
              onClick={() => setShowPremiumModal(false)}
              className="mt-3 w-full text-gray-500 text-sm hover:text-gray-700"
            >
              キャンセル
            </button>
          </div>
        </div>,
        document.body
      )
    : null;

  // ==== PCレイアウト ====
  if (!isMobile) {
    return (
      <>
        <div
          className={`fixed top-16 right-0 h-[calc(100vh-4rem)] w-96 bg-white shadow-2xl border-l border-gray-200 z-40 p-6 overflow-y-auto transition-all duration-300 ease-out ${
            isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-10"
          }`}
        >
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
          <p className="text-gray-700 text-sm mb-1">距離：約 {distance}</p>
          <p className="text-gray-700 text-sm mb-4">所要時間：約 {duration}</p>

          <div className="flex justify-end mb-3">
            <button
              onClick={() => {
                if (user?.is_premium) {
                  alert(`${shelter.name} を避難完了にしました`);
                } else {
                  setShowPremiumModal(true);
                }
              }}
              className={`px-4 py-2 rounded-md text-sm transition ${
                user?.is_premium
                  ? "bg-orange-500 text-white hover:bg-orange-600"
                  : "bg-orange-400 text-white hover:bg-orange-500"
              }`}
            >
              避難完了
            </button>
          </div>

          <FavoriteButton shelterId={shelter.id} />
        </div>

        {premiumModal}
      </>
    );
  }

  // ==== モバイルレイアウト ====
  return (
    <>
      <div
        className={`fixed inset-0 z-40 flex justify-center items-end transition-all duration-300 ease-out ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className={`bg-white w-full max-w-md rounded-t-2xl shadow-xl transition-all duration-500 ease-in-out ${
            isExpanded ? "h-[65vh]" : "h-[16vh]"
          }`}
          style={{
            position: "absolute",
            bottom: 56,
          }}
        >
          {/* --- ハンドルバー --- */}
          <div
            className="w-12 h-1.5 bg-gray-400 rounded-full mx-auto my-2 cursor-pointer"
            onClick={() => setIsExpanded(!isExpanded)}
          />

          {/* --- タイトル行（施設名＋閉じる） --- */}
          <div className="flex justify-between items-center px-6">
            <h2 className="text-lg font-bold text-gray-800 truncate">
              {shelter.name}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-800 text-lg"
              aria-label="閉じる"
            >
              ✕
            </button>
          </div>

          {/* --- 情報＆ボタンブロック（⭐︎とボタンを所要時間行に下揃え） --- */}
          <div className="flex justify-between items-end px-6 mt-2">
            {/* 左側：詳細情報 */}
            <div className="text-sm text-gray-700 space-y-1">
              <p>住所：{shelter.address}</p>
              <p>
                区分：
                {shelter.type === "accompany" ? "同行避難" : "同伴避難"}
              </p>
              <p>
                混雑度：
                <span
                  className={
                    shelter.crowd_level === "empty"
                      ? "text-green-600 font-semibold"
                      : shelter.crowd_level === "few"
                      ? "text-yellow-600 font-semibold"
                      : "text-red-600 font-semibold"
                  }
                >
                  {crowdLabelMap[shelter.crowd_level ?? "full"]}
                </span>
              </p>
              <p>距離：約 {distance}</p>
              <p>所要時間：約 {duration}</p>
            </div>

            {/* 右側：⭐＋避難完了ボタン（下揃え配置） */}
            <div className="flex flex-col items-end gap-2 justify-end pb-0.5">
              <div className="transform scale-125">
                <FavoriteButton shelterId={shelter.id} />
              </div>
              <button
                onClick={() => {
                  if (user?.is_premium) {
                    alert(`${shelter.name} を避難完了にしました`);
                  } else {
                    setShowPremiumModal(true);
                  }
                }}
                className={`px-4 py-2 rounded-md text-sm transition ${
                  user?.is_premium
                    ? "bg-orange-500 text-white hover:bg-orange-600"
                    : "bg-orange-400 text-white hover:bg-orange-500"
                }`}
              >
                避難完了
              </button>
            </div>
          </div>

          {/* --- 展開時（周辺避難所） --- */}
          {isExpanded && nearbyShelters.length > 0 && (
            <div className="px-6 mt-4 border-t pt-3">
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

      {premiumModal}
    </>
  );
}
