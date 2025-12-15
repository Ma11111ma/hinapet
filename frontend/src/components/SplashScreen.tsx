"use client";
import { useEffect, useState } from "react";
import Image from "next/image";

type Props = {
  onFinish: () => void;
};

export default function SplashScreen({ onFinish }: Props) {
  const [visible, setVisible] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // 2秒後にフェードアウト開始 → 3秒後に終了
    const fadeTimer = setTimeout(() => setFadeOut(true), 2000);
    const endTimer = setTimeout(() => {
      setVisible(false);
      onFinish();
    }, 3000);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(endTimer);
    };
  }, [onFinish]);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-amber-50 to-white transition-opacity duration-1000 ${
        fadeOut ? "opacity-0" : "opacity-100"
      }`}
    >
      {/* === ロゴ＋アイコン === */}
      <div className="flex items-center justify-center gap-4 sm:gap-6 mb-4 animate-float px-4">
        {/* 左：犬 */}
        <Image
          src="/assets/inu_icon.png"
          alt="犬のイラスト"
          width={90}
          height={90}
          className="drop-shadow-lg w-[18vw] sm:w-[70px] md:w-[90px] h-auto object-contain"
          priority
        />

        {/* 中央：ひなペットロゴ */}
        <Image
          src="/assets/hinapet_logo.png"
          alt="ひなペットロゴ"
          width={220}
          height={100}
          className="transition-transform duration-1000 ease-in-out scale-100 w-[55vw] sm:w-[220px] max-w-[300px] h-auto object-contain"
          priority
        />

        {/* 右：猫 */}
        <Image
          src="/assets/neko_icon.png"
          alt="猫のイラスト"
          width={90}
          height={90}
          className="drop-shadow-lg w-[18vw] sm:w-[70px] md:w-[90px] h-auto object-contain"
          priority
        />
      </div>

      {/* === サブテキスト === */}
      <p className="text-stone-600 text-s sm:text-sm md:text-base tracking-wide animate-fadeIn mt-2 text-center px-4">
        ペットと一緒に避難できる場所を探そう
      </p>

      {/* === 装飾・アニメーション === */}
      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-8px);
          }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 1.5s ease-in-out forwards;
        }
      `}</style>
    </div>
  );
}
