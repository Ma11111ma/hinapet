// frontend/src/components/FooterNav.tsx
"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { FaUserCircle, FaBookmark, FaDog } from "react-icons/fa";
import { GiHamburgerMenu } from "react-icons/gi";
import { signOut, onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebaseClient";
import { motion, AnimatePresence } from "framer-motion";
import MenuAccordion from "@/components/MenuAccordion";

export default function FooterNav() {
  const [user, setUser] = useState<User | null>(null);
  const [openMenu, setOpenMenu] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
    });
    return () => unsubscribe();
  }, []);

  // ✅ 外側クリックで閉じる
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const menu = document.getElementById("footer-menu");
      if (menu && !menu.contains(e.target as Node)) {
        setOpenMenu(false);
      }
    };
    if (openMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openMenu]);

  return (
    <nav className="fixed bottom-0 left-0 w-full bg-[#FFF3D9] border-t border-[#F6A93A]/30 shadow-sm z-30 flex justify-around py-2">
      {/* マイページ */}
      <Link
        href="/mypage"
        className="flex flex-col items-center text-[#8B4A18] hover:text-[#F6A93A] transition"
      >
        <FaUserCircle size={22} />
        <span className="text-xs mt-0.5 font-medium">マイページ</span>
      </Link>

      {/* ペット */}
      <Link
        href="/mypage?tab=pet"
        className="flex flex-col items-center text-[#8B4A18] hover:text-[#F6A93A] transition"
      >
        <FaDog size={22} />
        <span className="text-xs mt-0.5 font-medium">ペット</span>
      </Link>

      {/* 保存済み */}
      <Link
        href="/mypage"
        className="flex flex-col items-center text-[#8B4A18] hover:text-[#F6A93A] transition"
      >
        <FaBookmark size={20} />
        <span className="text-xs mt-0.5 font-medium">保存済み</span>
      </Link>

      {/* メニュー */}
      <div className="flex flex-col items-center relative">
        <button
          onClick={() => setOpenMenu((prev) => !prev)}
          className="flex flex-col items-center text-[#8B4A18] hover:text-[#F6A93A] transition focus:outline-none"
          aria-expanded={openMenu}
          aria-controls="footer-menu"
        >
          <GiHamburgerMenu size={22} />
          <span className="text-xs mt-0.5 font-medium">メニュー</span>
        </button>

        {/* ✅ メニュー展開 */}
        <AnimatePresence>
          {openMenu && (
            <motion.div
              id="footer-menu"
              key="menu"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: -8 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
              className="
                absolute bottom-[60px] right-0
                z-[9999]
                w-[min(88vw,15rem)]
              "
            >
              <MenuAccordion onClose={() => setOpenMenu(false)} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}
