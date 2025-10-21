"use client";

import React, { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { LoginFormUI } from "@/components/LoginFormUI";
import { useAuth } from "@/features/auth/AuthProvider";
import { auth } from "@/lib/firebaseClient";
import { postSession } from "@/lib/apiClient";
import Link from "next/link";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";

export default function LoginPage() {
  const { signInWithEmail } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

u/17-CheckoutButton
  // ✅ ログイン済みならトップまたはダッシュボードへ遷移
  useEffect(() => {
    if (authLoading) return;
    if (user) {
       router.replace("/"); // ログイン済みならトップへ
    }
  }, [authLoading, user, router]);

  // メール + パスワードログイン
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const result = await signInWithEmail(email, password);
      if (result?.user) {
        router.replace("/profileTabs"); // 成功時に /profileTabs へ遷移
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

  // Googleログイン
  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      if (result.user) {
        router.replace("/profileTabs"); // 成功時に /profileTabs へ遷移
      } else {
        setError("Google認証に失敗しました。");
      }
    } catch (err: unknown) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Googleログインに失敗しました");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
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
       {/* 中央寄せ・小さめ・ホバーで下線 */}
      <Link
        href="/"
        className="mt-6 inline-flex items-center text-sm text-blue-600 hover:text-blue-700 hover:underline"
      >
        <span aria-hidden>←</span>
        <span className="ml-1">ホームへ戻る</span>
      </Link>
    </main>
  );
}