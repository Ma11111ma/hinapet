// lib/firebaseClient.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, User } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// すでに初期化済みかをチェックし、再利用
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// IDトークン取得のヘルパー関数
export async function getIdToken(
  user: User | null,
  forceRefresh: boolean = false
) {
  if (!user) return null;
  return await user.getIdToken(forceRefresh);
}

// ✅ ログ（開発時のみ）
if (process.env.NODE_ENV === "development") {
  console.log("✅ Firebase initialized:", firebaseConfig.projectId);
}
