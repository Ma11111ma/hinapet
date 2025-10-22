"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function MyPage() {
  const pathname = usePathname();
  const active = (p: string) =>
    pathname.startsWith(p) ? "bg-indigo-600 text-white" : "bg-white text-gray-700";

  return (
    <main className="max-w-4xl mx-auto p-6">
      <h1 className="text-xl font-bold mb-4">マイページ</h1>
      <nav className="flex gap-2 mb-6">
        <Link className={`px-3 py-1 rounded border ${active("/mypage/user")}`} href="/mypage/user">ユーザー情報</Link>
        <Link className={`px-3 py-1 rounded border ${active("/mypage/pet")}`} href="/mypage/pet">ペット情報</Link>
      </nav>
      <p className="text-gray-500">左上のタブから編集したい情報を選んでください。</p>
    </main>
  );
}
