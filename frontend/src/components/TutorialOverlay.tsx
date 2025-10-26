"use client";
import { useState } from "react";

const steps = [
  {
    text: "ひなペットは災害時のペット避難を支援するアプリです🐾\n近くの避難所を地図でパッと探せます。",
  },
  { text: "同行避難所とは？飼い主とペットが建物内で共に避難する形態です。" },
  { text: "同伴避難所とは？屋外や別室でペットを預ける避難形態です。" },
];

export default function TutorialOverlay({
  onFinish,
}: {
  onFinish: () => void;
}) {
  const [step, setStep] = useState(0);

  return (
    <div className="fixed inset-0 bg-white flex flex-col items-center justify-center text-center px-8">
      <p className="text-stone-700 whitespace-pre-wrap leading-relaxed text-lg mb-10">
        {steps[step].text}
      </p>
      <button
        onClick={() =>
          step < steps.length - 1 ? setStep(step + 1) : onFinish()
        }
        className="px-6 py-2 bg-pink-300 text-white rounded-lg shadow"
      >
        {step < steps.length - 1 ? "次へ" : "はじめる"}
      </button>
    </div>
  );
}
