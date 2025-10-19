// src/app/layout.tsx
import { AuthProvider } from "@/features/auth/AuthProvider";
import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>
        <AuthProvider>
          {children} {/* ここに /login や /profile も含まれる */}
        </AuthProvider>
      </body>
    </html>
  );
}
