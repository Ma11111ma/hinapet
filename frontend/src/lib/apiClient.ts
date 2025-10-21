// frontend/src/lib/apiClient.ts
"use client";

import { auth } from "./firebaseClient"; // あなたの Firebase クライアント
import type { User } from "firebase/auth";

// 既存の postSession をそのまま保持
export const postSession = async (idToken: string) => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  const res = await fetch(`${apiUrl}/auth/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken }),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("❌ Auth verify failed:", text);
    throw new Error(`Failed to verify session: ${res.status}`);
  }

  return await res.json();
};

// ----------------------------------------------
// 新規追加：/users/me を呼ぶ関数
// ----------------------------------------------

export interface MeResponse {
  uid: string;
  email?: string | null;
}

/**
 * auth.currentUser から IDトークンを取得
 */
async function getIdTokenOrThrow(user: User | null): Promise<string> {
  if (!user) throw new Error("User is not logged in (auth.currentUser is null).");
  return await user.getIdToken(false); // forceRefresh=false でOK
}

/**
 * /users/me API を呼ぶ
 */
export async function fetchCurrentUser(): Promise<MeResponse> {
  const user = auth.currentUser;
  if (!user) throw new Error("No authenticated user. Please log in first.");

  const token = await getIdTokenOrThrow(user);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  const res = await fetch(`${apiUrl}/users/me`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`, // ここでトークン付与
    },
  });

  if (res.status === 401) {
    throw new Error("Unauthorized. Token may be invalid or expired.");
  }

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Server error: ${res.status} ${text}`);
  }

  const data = (await res.json()) as MeResponse;
  return data;
}
