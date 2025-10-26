// frontend/src/app/layout.tsx
"use client";
import React from "react";
import { Toaster } from "react-hot-toast";
import "./globals.css";
import Providers from "./providers";
import Header from "@/components/Header";
import FooterNav from "@/components/FooterNav";
import { LoadScript } from "@react-google-maps/api";

const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

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
          <LoadScript googleMapsApiKey={googleMapsApiKey}>
            <main className="relative overflow-hidden">{children}</main>
          </LoadScript>

          <FooterNav />
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
