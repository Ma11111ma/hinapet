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
    <nav className="fixed bottom-0 left-0 w-full bg-[#FFF3D9] border-t border-[#F6A93A]/30 shadow-sm z-20 flex justify-around py-2 relative">
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
          onClick={() => setOpenMenu((v) => !v)}
          className="flex flex-col items-center text-[#8B4A18] hover:text-[#F6A93A] transition focus:outline-none"
          aria-expanded={openMenu}
          aria-controls="footer-menu"
        >
          <GiHamburgerMenu size={22} />
          <span className="text-xs mt-0.5 font-medium">メニュー</span>
        </button>

        {/* メニュー展開部分（上方向にアニメーション） */}
        <AnimatePresence>
          {openMenu && (
            <motion.div
              id="footer-menu"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: -10 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.18 }}
              className="
        absolute bottom-12 right-0 z-50
        w-[min(88vw,16rem)] sm:w-64
        max-h-[70vh] overflow-y-auto
        bg-white rounded-2xl shadow-lg border border-amber-100
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
