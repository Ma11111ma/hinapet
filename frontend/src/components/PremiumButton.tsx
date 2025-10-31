"use client";

import { useState, useCallback } from "react";
import { getAuth } from "firebase/auth";

type Props = {
  apiBaseUrl?: string;
  onUnauthedNavigateTo?: string;
};

export default function PremiumButton({
  apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000",
  onUnauthedNavigateTo = "/login",
}: Props) {
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const goCheckout = useCallback(async () => {
    if (loading) return; // ✅ 二重クリック防止
    setErr(null);
    setLoading(true);

    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      window.location.href = onUnauthedNavigateTo;
      return;
    }

    try {
      const idToken = await user.getIdToken(true);
      const res = await fetch(`${apiBaseUrl}/premium/checkout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({}),
      });

      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          setErr(
            "セッションの有効期限が切れました。もう一度ログインしてください。"
          );
          setLoading(false);
          return;
        }
        const body = await res.text();
        throw new Error(`${res.status} ${res.statusText} ${body}`);
      }

      const data = (await res.json()) as { url?: string };
      if (!data.url) throw new Error("サーバからurlが返却されませんでした。");

      // ✅ Stripe 遷移直前に return。finallyで loading false に戻さない。
      window.location.href = data.url;
      return;
    } catch (e: unknown) {
      console.error(e);
      setErr(e instanceof Error ? e.message : "エラーが発生しました");
      setLoading(false);
    }
  }, [apiBaseUrl, onUnauthedNavigateTo, loading]);

  return (
    <div className="mt-4 text-center">
      <button
        onClick={goCheckout}
        disabled={loading}
        className={`px-5 py-2.5 rounded-lg font-semibold text-white shadow transition
          ${
            loading
              ? "bg-amber-300 cursor-not-allowed"
              : "bg-amber-500 hover:bg-amber-600"
          }`}
        aria-busy={loading}
      >
        {loading ? "処理中…" : "プレミアムに申し込む"}
      </button>

      {err && (
        <p role="alert" className="mt-2 text-sm text-red-600">
          エラー: {err}
        </p>
      )}
    </div>
  );
}
