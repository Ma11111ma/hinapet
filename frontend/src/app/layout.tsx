// frontend/src/app/layout.tsx
"use client"; // AuthProvider を使うのでクライアントコンポーネントにする

import React from "react";
import { AuthProvider } from "@/features/auth/AuthProvider";
import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>
        <AuthProvider>
          {children} {/* 全ページが AuthProvider のコンテキスト内でレンダリングされる */}
        </AuthProvider>
      </body>
    </html>
  );
}
