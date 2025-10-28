"use client";

import Link from "next/link";

export default function GuidancePage() {
  return (
    <main className="max-w-3xl mx-auto p-6 bg-amber-50 text-stone-800">
      <h1 className="text-2xl font-bold mb-4">🐕‍🦺 ペットとの避難の手引き</h1>
      <p className="mb-6">
        災害時にペットと安全に避難するための基本的な備えを紹介します。詳細は
        <Link
          href="https://www.city.fujisawa.kanagawa.jp/seiei/pet_bousai.html"
          target="_blank"
          className="text-amber-600 underline ml-1"
        >
          藤沢市公式サイト
        </Link>
        をご確認ください。
      </p>

      <section className="bg-white rounded-xl p-5 shadow-sm">
        <h2 className="text-xl font-semibold mb-3">避難用品・備蓄品の準備</h2>
        <p className="text-sm mb-4">
          災害時には物流が滞り、ペット用品が手に入りにくくなります。普段から5日分程度の物資を備えておきましょう。
        </p>

        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>フード（普段から食べ慣れているもの）（5日分）</li>
          <li>水（5日分）</li>
          <li>食器</li>
          <li>処方薬</li>
          <li>リード／首輪</li>
          <li>予備リード（伸縮しないもの）・予備首輪</li>
          <li>キャリーバッグ（クレート）</li>
          <li>ケージ（同行避難の際に必要）</li>
          <li>タオル・毛布</li>
          <li>ペットシーツ・新聞紙</li>
          <li>ゴミ袋</li>
          <li>使い慣れたおもちゃ</li>
          <li>洗濯ネット（猫の場合）</li>
          <li>口輪（必要に応じて）</li>
          <li>飼い主及びペットに関する情報</li>
          <li>ペットの写真（飼い主が一緒に写っているもの）</li>
        </ul>
      </section>
    </main>
  );
}
