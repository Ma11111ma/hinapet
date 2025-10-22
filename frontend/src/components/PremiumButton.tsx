"use client";

import { useState, useCallback } from "react";
import { getAuth } from "firebase/auth";

type Props = {
  apiBaseUrl?: string;
  onUnauthedNavigateTo?: string; // 未ログイン時の誘導先
};

export default function PremiumButton({
  apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000",
  onUnauthedNavigateTo = "/login",
}: Props) {
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const goCheckout = useCallback(async () => {
    setErr(null);

    // 1) 未ログインならログインへ誘導
    const auth = getAuth(); // デフォルトアプリから取得
    const user = auth.currentUser;
    if (!user) {
      window.location.href = onUnauthedNavigateTo;
      return;
    }

    try {
      setLoading(true);

      // 2) Firebase IDトークンを取得
      const idToken = await user.getIdToken(true); // 失効対策でtrue推奨

      // 3) /premium/checkout を呼び出し（Authorization付与）
      const res = await fetch(`${apiBaseUrl}/premium/checkout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({}), // サーバ側がボディ不要でも空JSONでOK
      });

      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          setErr(
            "セッションの有効期限が切れました。もう一度ログインしてください。"
          );
          // window.location.href = onUnauthedNavigateTo; // 自動遷移したいなら有効化
          return;
        }
        const body = await res.text();
        throw new Error(`${res.status} ${res.statusText} ${body}`);
      }

      // 4) 返却 { url } に遷移（Stripe Checkoutへ）
      const data = (await res.json()) as { url?: string };
      if (!data.url) throw new Error("サーバからurlが返却されませんでした。");
      window.location.href = data.url;
    } catch (e: unknown) {
      console.error(e);
      if (e instanceof Error) {
        setErr(e.message);
      } else {
        setErr("エラーが発生しました");
      }
    } finally {
      setLoading(false);
    }
  }, [apiBaseUrl, onUnauthedNavigateTo]);

  return (
    <div style={{ marginTop: 16 }}>
      <button
        onClick={goCheckout}
        disabled={loading}
        style={{
          padding: "10px 16px",
          borderRadius: 8,
          background: loading ? "#a5b4fc" : "#6366f1",
          color: "#fff",
        }}
        aria-busy={loading}
      >
        {loading ? "処理中…" : "プレミアムに申し込む"}
      </button>
      {err && (
        <p role="alert" style={{ color: "crimson", marginTop: 8 }}>
          エラー: {err}
        </p>
      )}
    </div>
  );
}
