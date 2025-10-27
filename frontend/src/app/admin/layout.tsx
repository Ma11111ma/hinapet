"use client";

import React, { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/features/auth/AuthProvider";

/**
 * /admin 配下の共通レイアウト
 * - 未ログイン時は /admin/login へ
 * - /admin/login はこのレイアウトの外に出したい場合は matcher を調整するが、
 *   App Router では同階層なのでここで path 判断して回避する
 */
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, initialized, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // /admin/login 自体はガードしない
    if (pathname?.startsWith("/admin/login")) return;

    if (initialized && !loading && !user) {
      router.replace("/admin/login");
    }
  }, [initialized, loading, user, router, pathname]);

  // 初期状態・確認中はチラつき防止
  if (!initialized || loading) {
    return (
      <div className="min-h-screen bg-[#E8F6FB] flex items-center justify-center">
        読み込み中…
      </div>
    );
  }
  if (!user && !pathname?.startsWith("/admin/login")) {
    return <div className="min-h-screen bg-[#E8F6FB]" />;
  }

  return <>{children}</>;
}
