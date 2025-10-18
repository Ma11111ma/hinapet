"use client";
// src/app/login/page.tsx
import React, { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { LoginFormUI } from "@/components/LoginFormUI";
import { useAuth } from "@/features/auth/useAuth";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebaseClient";
import { postSession } from "@/lib/apiClient";

export default function LoginPage() {
  const {
    user,
    signInWithEmail,
    signInWithGoogle,
    loading: authLoading,
  } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ✅ ログイン済みならトップまたはダッシュボードへ遷移
  useEffect(() => {
    if (authLoading) return;
    if (user) {
      // router.replace("/"); // または `/dashboard` に変更してもOK
    }
  }, [authLoading, user, router]);

  // ✅ メール + パスワードログイン処理
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await signInWithEmail(email, password);
      // 成功後は useEffect 側で自動遷移
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("ログインに失敗しました");
      }
    } finally {
      setLoading(false);
    }
  };

  // ✅ Googleログイン処理
  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      await signInWithGoogle();
      // 成功後は useEffect 側で自動遷移
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Googleログインに失敗しました");
      }
    } finally {
      setLoading(false);
    }
  };

  // ✅ 新規登録（Email + Password）
  const handleSignUp = async () => {
    setError(null);
    setLoading(true);
    try {
      const credential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const idToken = await credential.user.getIdToken();
      console.log("🔑Firebase ID Token:", idToken);
      await postSession(idToken); // backend /auth/verify 呼び出し
      console.log("✅ 新規登録成功:", credential.user.email);
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError("新規登録に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  // ✅ UI表示
  return (
    <main className="flex justify-center items-center min-h-screen bg-gray-50">
      <LoginFormUI
        email={email}
        password={password}
        onEmailChange={setEmail}
        onPasswordChange={setPassword}
        onSubmit={handleSubmit}
        onSignUp={handleSignUp}
        onGoogleSignIn={handleGoogleSignIn}
        loading={loading || authLoading}
        error={error}
      />
    </main>
  );
}
