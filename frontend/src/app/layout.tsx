// src/app/layout.tsx
import "./globals.css";
import { Inter } from "next/font/google";
import { Providers } from "./providers";
import React from "react";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className={inter.className}>
        <Providers>
          {children}

          {/* ✅ トースト通知コンテナをアプリ全体に配置 */}
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
