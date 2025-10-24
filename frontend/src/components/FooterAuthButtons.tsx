"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { signOut, onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebaseClient";

/**
 * トップページ下部に配置するログイン／ログアウトボタン。
 * 視認性を高めるため、カード風のデザインに改良。
 */
export default function FooterAuthButtons() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) return null;

  const handleLogout = async () => {
    try {
      await signOut(auth);
      console.log("ログアウトしました");
      setUser(null);
    } catch (err) {
      console.error("ログアウトに失敗しました:", err);
    }
  };

  return (
    <footer className="w-full mt-10 border-t pt-6 pb-8 bg-gray-50 flex justify-center">
      {!user ? (
        <Link
          href="/login"
          className="px-6 py-2 bg-blue-600 text-white rounded-md shadow hover:bg-blue-700 transition"
        >
          ログインはこちら
        </Link>
      ) : (
        <button
          onClick={handleLogout}
          className="px-6 py-2 bg-gray-600 text-white rounded-md shadow hover:bg-gray-700 transition"
        >
          ログアウト
        </button>
      )}
    </footer>
  );
}
