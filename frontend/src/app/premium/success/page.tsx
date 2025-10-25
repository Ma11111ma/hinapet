import Link from "next/link";

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const params = await searchParams;
  const sessionId = params?.session_id;

  return (
    <main className="p-8 text-center">
      <h1 className="text-2xl font-bold text-green-600 mb-4">
        決済が完了しました 🎉🎉🎉
      </h1>

      {sessionId ? (
        <p className="text-gray-700 mb-4">セッションID: {sessionId}</p>
      ) : (
        <p className="mb-4">セッションIDが見つかりません。</p>
      )}

      <Link
        href="/"
        className="inline-block px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
      >
        トップページへ戻る
      </Link>
    </main>
  );
}
