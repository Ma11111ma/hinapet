"use client";
import MapView from "../../src/components/MapView";
import PremiumButton from "../components/PremiumButton";

import Link from "next/link";

import FooterAuthButtons from "../../src/components/FooterAuthButtons";


export default function Page() {
  return (
    <main style={{ padding: 16 }}>
      <h1>避難所マップ</h1>
      <MapView />

      <section style={{ marginTop: 24 }}>
        <h2>プレミアム機能</h2>
        <p>プレミアムに登録すると追加機能が利用できます。</p>
        {/* 未ログインなら /login に誘導 */}
        <PremiumButton onUnauthedNavigateTo="/login" />
      </section>


      {/* マイページへの導線 */}
      <p style={{ marginTop: 16 }}>
        <Link href="/mypage" style={{ color: "#2563eb", textDecoration: "underline" }}>
          → マイページへ
        </Link>
      </p>

      <FooterAuthButtons />
    </main>
  );
}
