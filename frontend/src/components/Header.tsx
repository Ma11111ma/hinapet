"use client";
import Link from "next/link";
import { IoNotificationsOutline } from "react-icons/io5";
import { FaPaw } from "react-icons/fa";

export default function Header() {
  return (
    <header className="fixed top-0 left-0 w-full bg-white shadow-md z-20 flex items-center justify-between px-4 py-2">
      <div className="flex items-center space-x-2">
        <FaPaw className="text-orange-500 text-2xl" />
        <h1 className="text-lg font-bold text-gray-800">ひなペット</h1>
      </div>

      <div className="flex items-center space-x-4">
        {/* 🧩 ログインボタン */}
        <Link
          href="/login"
          className="text-sm font-medium text-blue-600 hover:text-blue-800"
        >
          ログイン
        </Link>
        {/* 🔔 通知アイコン */}
        <div className="relative">
          <IoNotificationsOutline className="text-2xl text-gray-700" />
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] rounded-full px-[4px] py-[1px]">
            3
          </span>
        </div>
      </div>
    </header>
  );
}
