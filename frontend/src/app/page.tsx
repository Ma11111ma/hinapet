import MapView from "../../src/components/MapView";
import PremiumButton from "../components/PremiumButton";

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
    </main>
  );
}
