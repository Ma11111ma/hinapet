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
 * ✅ 改善版チュートリアルオーバーレイ（安全版）
 * - MapViewから受け取ったpositions（DOMRect）を基準に正確な位置へ切り抜き
 * - 地図は透けて見える（透明オーバーレイ）
 * - 「次へ」でスムーズに同伴避難所へ移動
 */
export default function TutorialOverlay({ onFinish, positions }: Props) {
  const [step, setStep] = useState<"accompany" | "companion">("accompany");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
  }, []);

  const goNext = () => {
    if (step === "accompany") {
      setStep("companion");
    } else {
      onFinish();
    }
  };

  // === 現在のフォーカス対象ボタン ===
  const focusRect =
    step === "accompany" ? positions?.accompany : positions?.companion;

  // ⚠ positionsがまだ取れていないときは一瞬null（描画を待つ）
  if (!focusRect) {
    return (
      <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white text-sm">
        ロード中...
      </div>
    );
  }

  const focusColor = step === "accompany" ? "#3B82F6" : "#22C55E";

  return (
    <div
      className={`absolute inset-0 transition-opacity duration-500 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
      style={{ pointerEvents: "none" }}
    >
      {/* ====== 切り抜き暗幕（穴あき） ====== */}
      <div
        className="absolute rounded-full"
        style={{
          top: `${focusRect.top + window.scrollY}px`,
          left: `${focusRect.left}px`,
          width: `${focusRect.width}px`,
          height: `${focusRect.height}px`,
          borderRadius: "9999px",
          boxShadow: "0 0 0 9999px rgba(0,0,0,0.78)",
          transition: "all 300ms ease",
          pointerEvents: "none",
        }}
      />

      {/* ====== フォーカス枠線 ====== */}
      <div
        className="absolute rounded-full"
        style={{
          top: `${focusRect.top + window.scrollY - 2}px`,
          left: `${focusRect.left - 2}px`,
          width: `${focusRect.width + 4}px`,
          height: `${focusRect.height + 4}px`,
          borderRadius: "9999px",
          border: `2px solid ${focusColor}`,
          boxShadow: `0 0 12px 3px ${focusColor}40`,
          transition: "all 300ms ease",
          pointerEvents: "none",
        }}
      />

      {/* ====== 説明カード ====== */}
      <div
        className="absolute bottom-[160px] w-full flex justify-center pointer-events-auto"
        style={{ zIndex: 5 }}
      >
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
