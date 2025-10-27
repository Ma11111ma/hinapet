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
  // 3段階ステップ：intro → accompany → companion
  type Step = "intro" | "accompany" | "companion";
  const [step, setStep] = useState<Step>("intro");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
  }, []);

  const goNext = () => {
    if (step === "intro") setStep("accompany");
    else if (step === "accompany") setStep("companion");
    else onFinish();
  };

  // Intro時はフォーカスを同行ボタンに合わせる
  const focusRect =
    step === "intro" || step === "accompany"
      ? positions?.accompany
      : positions?.companion;

  if (!focusRect) return null;

  return (
    <div
      className={`absolute inset-0 transition-opacity duration-500 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
      style={{ pointerEvents: "none" }}
    >
      {/* === 暗幕 === */}
      <div className="absolute inset-0 bg-black/70 z-[1]" />

      {/* === フォーカス切り抜き === */}
      <svg
        className="absolute inset-0 z-[2] pointer-events-none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <mask id="focusMask">
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
        <rect
          width="100%"
          height="100%"
          fill="rgba(0,0,0,0.7)"
          mask="url(#focusMask)"
        />
      </svg>

      {/* === ボタン枠 === */}
      <div
        className="absolute z-[3] rounded-full pointer-events-none"
        style={{
          top: `${focusRect.top - 2}px`,
          left: `${focusRect.left - 2}px`,
          width: `${focusRect.width + 4}px`,
          height: `${focusRect.height + 4}px`,
          borderRadius: "9999px",
          border: `2px solid ${
            step === "companion"
              ? "#22C55E"
              : step === "accompany"
              ? "#3B82F6"
              : "#3B82F6"
          }`,
          boxShadow: `0 0 15px ${
            step === "companion"
              ? "#22C55E"
              : step === "accompany"
              ? "#3B82F6"
              : "#3B82F6"
          }80`,
          transition: "all 0.3s ease",
        }}
      />

      {/* === 白パネル === */}
      <div className="absolute bottom-[240px] w-full flex justify-center pointer-events-auto z-[4]">
        <div className="w-[85%] max-w-sm bg-white rounded-2xl shadow-xl p-5 text-center">
          {step === "intro" && (
            <>
              <h2 className="text-lg font-bold text-[#8B4A18] mb-2">
                ひなペットとは？
              </h2>
              <p className="font-semibold text-stone-600 text-m mb-4 leading-relaxed">
                ひなペットは災害時のペット避難を
                <br />
                サポートする地図アプリです🐾
                <br />
                ペットを連れて行ける近くの避難所を
                <br />
                地図でパッと探せます。
              </p>
              <button
                onClick={goNext}
                className="px-6 py-2 bg-[#3B82F6] text-white rounded-lg shadow hover:bg-[#2563EB] transition-colors"
              >
                次へ
              </button>
            </>
          )}

          {step === "accompany" && (
            <>
              <h2 className="text-lg font-semibold  text-stone-800 mb-2">
                同行避難とは？
              </h2>
              <p className="text-stone-600 text-sm mb-4 leading-relaxed">
                飼い主とペットが一緒に避難しますが、
                建物内ではなく屋外や別室などにペットを預ける避難形態です。
              </p>
              <button
                onClick={goNext}
                className="px-6 py-2 bg-[#3B82F6] text-white rounded-lg shadow hover:bg-[#2563EB] transition-colors"
              >
                次へ
              </button>
            </>
          )}

          {step === "companion" && (
            <>
              <h2 className="text-lg font-semibold text-stone-800 mb-2">
                同伴避難とは？
              </h2>
              <p className="text-stone-600 text-sm mb-4 leading-relaxed">
                飼い主とペットが一緒に建物内で避難できる避難所のことです。
                <br />
                ペットと同じ空間で過ごせます。
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
