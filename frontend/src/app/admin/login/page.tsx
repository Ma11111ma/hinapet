"use client";

import React, { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "@/lib/firebaseClient";
import { useAuth } from "@/features/auth/AuthProvider";
import { LoginFormUI } from "@/components/LoginFormUI";

/**
 * ✅ 管理者専用ログイン
 * - 既存の LoginFormUI をそのまま再利用
 * - 成功時の遷移先だけ /admin にする
 * - 共通ログインにある「ログイン済みなら /mypage へ」等の useEffect は入れない
 */
export default function AdminLoginPage() {
  const router = useRouter();
  const { signInWithEmail } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const result = await signInWithEmail(email, password);
      if (result?.user) {
        router.replace("/admin"); // ← ここがポイント
      } else {
        setError("メールアドレスまたはパスワードが正しくありません。");
      }
    } catch (err: unknown) {
      console.error(err);
      setError(err instanceof Error ? err.message : "ログインに失敗しました");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      if (result.user) {
        router.replace("/admin"); // ← ここがポイント
      } else {
        setError("Google認証に失敗しました。");
      }
    } catch (err: unknown) {
      console.error(err);
      setError(
        err instanceof Error ? err.message : "Googleログインに失敗しました"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#E8F6FB] flex flex-col items-center justify-center p-6">
      <h1 className="text-2xl font-bold text-[#1C507C] mb-4">管理者ログイン</h1>
      <LoginFormUI
        email={email}
        password={password}
        onEmailChange={setEmail}
        onPasswordChange={setPassword}
        onSubmit={handleSubmit}
        onGoogleSignIn={handleGoogleSignIn}
        loading={loading}
        error={error}
      />
    </main>
  );
}
