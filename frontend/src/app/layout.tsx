// frontend/src/app/layout.tsx
"use client";
import React from "react";
import { Toaster } from "react-hot-toast";
import "./globals.css";
import Providers from "./providers";
import Header from "@/components/Header";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className="bg-amber-50 text-stone-800">
        {/* ✅ 全ページ共通ヘッダー */}
        <Header />
        <Providers>
          {/* ✅ ページごとの内容（トップページ含む） */}
          <main className="relative overflow-hidden">{children}</main>

          {/* ✅ Toast通知 */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 2500,
              style: { fontSize: "0.9rem" },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
