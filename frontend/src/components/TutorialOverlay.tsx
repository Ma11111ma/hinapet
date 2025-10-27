"use client";
import { useEffect, useState } from "react";

type Props = {
  onFinish: () => void;
  positions?: {
    accompany?: DOMRect;
    companion?: DOMRect;
  };
};

/**
 * ✅ チュートリアル説明オーバーレイ
 * - フォーカスされたボタンのみ明るく残し、それ以外は暗幕で覆う
 * - 地図は透けるが、検索窓や他ボタンは暗く見える
 */
export default function TutorialOverlay({ onFinish, positions }: Props) {
  const [step, setStep] = useState<"accompany" | "companion">("accompany");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
  }, []);

  const goNext = () => {
    if (step === "accompany") setStep("companion");
    else onFinish();
  };

  const focusRect =
    step === "accompany" ? positions?.accompany : positions?.companion;

  if (!focusRect) return null;

  return (
    <div
      className={`absolute inset-0 transition-opacity duration-500 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
      style={{ pointerEvents: "none" }}
    >
      {/* === 暗幕（まず全体を暗く覆う） === */}
      <div className="absolute inset-0 bg-black/70 z-[1]" />

      {/* === 切り抜きエリア（フォーカスボタンを明るく残す） === */}
      <svg
        className="absolute inset-0 z-[2] pointer-events-none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <mask id="focusMask">
            {/* 黒＝非表示（暗い部分）・白＝見せる部分 */}
            <rect width="100%" height="100%" fill="black" />
            <rect
              x={focusRect.left}
              y={focusRect.top}
              width={focusRect.width}
              height={focusRect.height}
              rx={9999}
              ry={9999}
              fill="white"
            />
          </mask>
        </defs>
        {/* 背景全体にマスクを適用し、フォーカス部分のみ透過 */}
        <rect
          width="100%"
          height="100%"
          fill="rgba(0,0,0,0.7)"
          mask="url(#focusMask)"
        />
      </svg>

      {/* === フォーカス枠（カラー強調） === */}
      <div
        className="absolute z-[3] rounded-full pointer-events-none"
        style={{
          top: `${focusRect.top - 2}px`,
          left: `${focusRect.left - 2}px`,
          width: `${focusRect.width + 4}px`,
          height: `${focusRect.height + 4}px`,
          borderRadius: "9999px",
          border: `2px solid ${step === "accompany" ? "#3B82F6" : "#22C55E"}`,
          boxShadow: `0 0 15px ${
            step === "accompany" ? "#3B82F6" : "#22C55E"
          }80`,
          transition: "all 0.3s ease",
        }}
      />

      {/* === テキストカード === */}
      <div className="absolute bottom-[240px] w-full flex justify-center pointer-events-auto z-[4]">
        <div className="w-[85%] max-w-sm bg-white rounded-2xl shadow-xl p-5 text-center">
          {step === "accompany" ? (
            <>
              <h2 className="text-lg font-semibold text-stone-800 mb-2">
                同行避難とは？
              </h2>
              <p className="text-stone-600 text-sm mb-4 leading-relaxed">
                飼い主とペットが一緒に建物内で避難できる避難所のことです。
                <br />
                ペットと同じ空間で過ごせます。
              </p>
              <button
                onClick={goNext}
                className="px-6 py-2 bg-[#3B82F6] text-white rounded-lg shadow hover:bg-[#2563EB] transition-colors"
              >
                次へ
              </button>
            </>
          ) : (
            <>
              <h2 className="text-lg font-semibold text-stone-800 mb-2">
                同伴避難とは？
              </h2>
              <p className="text-stone-600 text-sm mb-4 leading-relaxed">
                飼い主とペットが一緒に避難しますが、建物内ではなく
                <br />
                屋外や別室などにペットを預ける避難形態です。
              </p>
              <button
                onClick={goNext}
                className="px-6 py-2 bg-[#22C55E] text-white rounded-lg shadow hover:bg-[#16A34A] transition-colors"
              >
                閉じる
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
