'use client';

import Link from 'next/link';

type Props = {
  searchParams: { session_id?: string };
};

export default function SuccessPage({ searchParams }: Props) {
  const sessionId = searchParams.session_id ?? '(missing)';

  return (
    <main style={{ padding: 24 }}>
      <h1>決済が完了しました 🎉</h1>
      <p>Stripe の Checkout セッション ID: <code>{sessionId}</code></p>

      <p style={{ marginTop: 16 }}>
        この画面が出れば <strong>バックエンド → Stripe → フロントのリダイレクト</strong> まで成功です。
      </p>

      <div style={{ marginTop: 24 }}>
        <Link href="/">トップへ戻る</Link>
      </div>
    </main>
  );
}
