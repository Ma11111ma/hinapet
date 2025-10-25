//import { Inter } from "next/font/google";
//import { Providers } from "./providers";
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
        <Header />
        <Providers>
          <main className="max-w-5xl mx-auto px-4 py-6">{children}</main>
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
