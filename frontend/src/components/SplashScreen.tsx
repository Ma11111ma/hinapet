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
      className={`fixed inset-0 flex flex-col items-center justify-center bg-white transition-opacity duration-1000 ${
        fadeOut ? "opacity-0" : "opacity-100"
      }`}
    >
      <div className="flex items-center justify-center gap-6 mb-4 animate-float">
        <Image
          src="/assets/犬のアイコン 5.png"
          alt="犬のイラスト"
          width={90}
          height={90}
          className="drop-shadow-lg"
        />
        <Image
          src="/assets/ひなペットlogo.png"
          alt="ひなペットロゴ"
          width={220}
          height={100}
          className="transition-transform duration-1000 ease-in-out scale-100"
        />
        <Image
          src="/assets/犬のフリーアイコン.png"
          alt="猫のイラスト"
          width={90}
          height={90}
          className="drop-shadow-lg"
        />
      </div>

      <p className="text-stone-600 text-sm tracking-wide animate-fadeIn mt-2">
        ペットと一緒に避難できる場所を探そう
      </p>

      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
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
