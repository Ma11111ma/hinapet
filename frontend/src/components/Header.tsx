"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { IoNotificationsOutline } from "react-icons/io5";
import { FaPaw } from "react-icons/fa";
import { signOut, onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebaseClient";

// ✅ 追加：ローカル管理用ユーティリティ（未読数/既読化）
import { unreadCount, markAllRead } from "@/lib/localAdmin";

export default function Header() {
  const [user, setUser] = useState<User | null>(null);

  // 🔔 未読数を state で保持（storage 変更に追従）
  const [badge, setBadge] = useState<number>(0);

  useEffect(() => {
    // 初期カウント
    setBadge(unreadCount());

    // admin-notices の保存時に localAdmin 側が StorageEvent を投げるので受け取る
    const handleStorage = (e: StorageEvent) => {
      if (!e.key || e.key === "admin-notices") {
        setBadge(unreadCount());
      }
    };
    window.addEventListener("storage", handleStorage);

    // 画面に戻ってきた時の再計算（別タブで既読にした/追加したなど）
    const handleFocus = () => setBadge(unreadCount());
    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
    });
    return () => unsubscribe();
  }, []);

  const handleAuthClick = async () => {
    if (user) {
      await signOut(auth);
      setUser(null);
    } else {
      window.location.href = "/login";
    }
  };

  // 🔔 ベルをクリックしたらマイページへ遷移＆既読化
  const handleBellClick: React.MouseEventHandler<HTMLAnchorElement> = () => {
    // 住民UIに入るタイミングで未読を既読化（要件に合わせて外してもOK）
    markAllRead();
    setBadge(0);
  };

  return (
    <header className="sticky top-0 z-30 w-full bg-[#FFF3D9] h-14 shadow-sm transition-shadow duration-200">
      <div className="mx-auto max-w-screen-lg flex items-center justify-between px-4 h-full">
        {/* 🐾 ロゴ */}
        <Link
          href="/"
          className="flex items-center gap-2 hover:opacity-80 transition"
        >
          <FaPaw className="text-[#F6A93A] text-xl" />
          <span className="font-bold text-lg text-[#8B4A18]">ひなペット</span>
        </Link>

        <div className="flex items-center space-x-4">
          {/* 🔐 ログイン／ログアウト */}
          <button
            onClick={handleAuthClick}
            className="text-sm font-medium text-[#8B4A18] hover:text-[#F6A93A] transition"
          >
            {user ? "ログアウト" : "ログイン"}
          </button>

          {/* 🔔 通知アイコン（未読バッジは localStorage 由来） */}
          <Link
            href="/mypage"
            onClick={handleBellClick}
            className="relative flex items-center justify-center hover:text-[#F6A93A] transition"
            aria-label="お知らせ"
          >
            <IoNotificationsOutline className="text-2xl text-[#8B4A18]" />
            {badge > 0 && (
              <span
                className="absolute -top-1 -right-1 bg-[#F6A93A] text-white
                           text-[10px] rounded-full px-[4px] py-[1px] min-w-[16px]
                           flex items-center justify-center"
              >
                {badge}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
