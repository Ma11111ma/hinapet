"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { IoNotificationsOutline } from "react-icons/io5";
import { FaPaw } from "react-icons/fa";
import { signOut, onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase";

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
    <header className="sticky top-0 z-30 w-full bg-white/90 backdrop-blur-md shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="mx-auto max-w-screen-lg flex items-center justify-between px-4 py-2">
        {/* 🐾 ロゴ部分 */}
        <Link
          href="/"
          className="flex items-center gap-2 hover:opacity-80 transition"
        >
          <FaPaw className="text-orange-500 text-xl" />
          <span className="font-bold text-lg text-gray-800">ひなペット</span>
        </Link>

        <div className="flex items-center space-x-4">
          {/* 🔐 ログイン／ログアウト */}
          <button
            onClick={handleAuthClick}
            className={`text-sm font-medium ${
              user
                ? "text-gray-600 hover:text-gray-800"
                : "text-blue-600 hover:text-blue-800"
            } transition`}
          >
            {user ? "ログアウト" : "ログイン"}
          </button>

          {/* 🔔 通知アイコン（クリックで /profileTabs） */}
          <Link
            href="/profileTabs"
            className="relative flex items-center justify-center hover:text-orange-500 transition"
          >
            <IoNotificationsOutline className="text-2xl text-gray-700" />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] rounded-full px-[4px] py-[1px]">
              3
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
}
