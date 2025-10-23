// frontend/src/components/FooterNav.tsx
"use client";
import { FaUserCircle, FaBookmark, FaDog } from "react-icons/fa";
import { GiHamburgerMenu } from "react-icons/gi";

export default function FooterNav() {
  return (
    <nav className="fixed bottom-0 left-0 w-full bg-white shadow-inner z-20 flex justify-around py-2">
      <button className="flex flex-col items-center text-gray-600 hover:text-orange-500">
        <FaUserCircle size={22} />
        <span className="text-xs">マイページ</span>
      </button>
      <button className="flex flex-col items-center text-gray-600 hover:text-orange-500">
        <FaDog size={22} />
        <span className="text-xs">ペット</span>
      </button>
      <button className="flex flex-col items-center text-gray-600 hover:text-orange-500">
        <FaBookmark size={20} />
        <span className="text-xs">保存済み</span>
      </button>
      <button className="flex flex-col items-center text-gray-600 hover:text-orange-500">
        <GiHamburgerMenu size={22} />
        <span className="text-xs">メニュー</span>
      </button>
    </nav>
  );
}
