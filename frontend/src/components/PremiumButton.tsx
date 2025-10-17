'use client';
import { useState } from 'react';

type Props = { apiBaseUrl?: string };

export default function PremiumButton({ apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000' }: Props) {
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const goCheckout = async () => {
    setErr(null);
    setLoading(true);
    try {
      const res = await fetch(`${apiBaseUrl}/premium/checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // 認証が入ったらここに Authorization を付ける
          // 'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify({}),
      });

      if (!res.ok) {
        const body = await res.text();
        throw new Error(`${res.status} ${res.statusText} ${body}`);
      }
      const data = await res.json();
      window.location.href = data.url as string;
    } catch (e: any) {
      console.error(e);
      setErr(e?.message ?? 'エラーが発生しました');
      setLoading(false);
    }
  };

  return (
    <div style={{ marginTop: 16 }}>
      <button
        onClick={goCheckout}
        disabled={loading}
        style={{
          padding: '10px 16px',
          borderRadius: 8,
          background: loading ? '#a5b4fc' : '#6366f1',
          color: '#fff',
        }}
      >
        {loading ? 'リダイレクト中…' : 'プレミアムに申し込む'}
      </button>
      {err && <p style={{ color: 'crimson', marginTop: 8 }}>エラー: {err}</p>}
    </div>
  );
}

