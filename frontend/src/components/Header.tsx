"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { IoNotificationsOutline } from "react-icons/io5";
import { FaPaw } from "react-icons/fa";
import { signOut, onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebaseClient";

export default function Header() {
  const [user, setUser] = useState<User | null>(null);

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

  return (
    <header className="sticky top-0 z-30 w-full bg-[#FFF3D9] h-14 shadow-sm transition-shadow duration-200">
      <div className="mx-auto max-w-screen-lg flex items-center justify-between px-4 h-full">
        {/* 🐾 ロゴ部分 */}
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
            className={`text-sm font-medium transition ${
              user
                ? "text-[#8B4A18] hover:text-[#F6A93A]"
                : "text-[#8B4A18] hover:text-[#F6A93A]"
            }`}
          >
            {user ? "ログアウト" : "ログイン"}
          </button>

          {/* 🔔 通知アイコン */}
          <Link
            href="/profileTabs"
            className="relative flex items-center justify-center hover:text-[#F6A93A] transition"
          >
            <IoNotificationsOutline className="text-2xl text-[#8B4A18]" />
            <span className="absolute -top-1 -right-1 bg-[#F6A93A] text-white text-[10px] rounded-full px-[4px] py-[1px]">
              3
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
}
