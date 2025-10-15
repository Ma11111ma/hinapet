// frontend/src/app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AuthProvider } from "@features/auth/AuthProvider"; // ✅ 追加！

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Pet Evacuation App",
  description: "避難時にペットと一緒に行動できる支援アプリ",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className={inter.className}>
        {/* ✅ AuthProvider で全体をラップする */}
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
