"use client";

import PremiumButton from "@/components/PremiumButton";

type Props = {
  show: boolean;
  onClose: () => void;
};

export default function PremiumModal({ show, onClose }: Props) {
  if (!show) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 z-[9999999] flex items-center justify-center"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl p-6 w-80 text-center"
      >
        <h3 className="text-lg font-bold mb-2 text-stone-800">
          プレミアム機能のご案内
        </h3>
        <p className="text-sm text-gray-600 mb-5 leading-relaxed">
          プレミアム登録で「チェックリスト保存」や家族の「避難完了」確認などの機能が利用できます。
        </p>
        <PremiumButton /> {/* オレンジStripeボタン */}
        <button
          onClick={onClose}
          className="mt-4 text-sm text-gray-500 hover:text-gray-700 underline"
        >
          閉じる
        </button>
      </div>
    </div>
  );
}
