'use client';

import Link from 'next/link';

export default function CanceledPage() {
  return (
    <main style={{ padding: 24 }}>
      <h1>決済をキャンセルしました</h1>
      <p>必要であればもう一度お試しください。</p>

      <div style={{ marginTop: 24 }}>
        <Link href="/">トップへ戻る</Link>
      </div>
    </main>
  );
}
