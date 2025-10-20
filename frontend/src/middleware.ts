import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("token"); // ※CookieにIDトークンを保存している場合
  const url = req.nextUrl.clone();

  // 認証必須ページ（今回は /dashboard を守る）
  const protectedPaths = ["/dashboard"];

  if (protectedPaths.some((path) => url.pathname.startsWith(path))) {
    if (!token) {
      url.pathname = "/"; // トップページ（frontend/src/app/page.tsx）へリダイレクト
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"], // 必要に応じて増やす
};
