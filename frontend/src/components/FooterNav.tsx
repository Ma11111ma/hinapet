// frontend/src/components/FooterNav.tsx
"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { FaUserCircle, FaBookmark, FaDog, FaBell } from "react-icons/fa";
import { GiHamburgerMenu } from "react-icons/gi";
import { signOut, onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function FooterNav() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
    });
    return () => unsubscribe();
  }, []);

  const handleAuthClick = async () => {
    if (user) {
      // ログアウト処理
      await signOut(auth);
      setUser(null);
    } else {
      // ログインページへ遷移
      window.location.href = "/login";
    }
  };

  return (
    <nav className="fixed bottom-0 left-0 w-full bg-white shadow-inner z-20 flex justify-around py-2">
      {/* マイページ */}
      <Link
        href="/profileTabs"
        className="flex flex-col items-center text-gray-600 hover:text-orange-500"
      >
        <FaUserCircle size={22} />
        <span className="text-xs">マイページ</span>
      </Link>

      {/* ペット */}
      <Link
        href="/profileTabs"
        className="flex flex-col items-center text-gray-600 hover:text-orange-500"
      >
        <FaDog size={22} />
        <span className="text-xs">ペット</span>
      </Link>

      {/* 保存済み */}
      <Link
        href="/profileTabs"
        className="flex flex-col items-center text-gray-600 hover:text-orange-500"
      >
        <FaBookmark size={20} />
        <span className="text-xs">保存済み</span>
      </Link>

      {/* メニュー（ログイン／ログアウト） */}
      <button
        onClick={handleAuthClick}
        className="flex flex-col items-center text-gray-600 hover:text-orange-500"
      >
        <GiHamburgerMenu size={22} />
        <span className="text-xs">{user ? "ログアウト" : "ログイン"}</span>
      </button>
    </nav>
  );
}
