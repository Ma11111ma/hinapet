"use client"; 
// src/app/login/page.tsx
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { LoginForm } from "@/components/LoginFormUI";
import { useAuth } from "@/features/auth/useAuth";

export default function LoginPage() {
  const { user, signInWithEmail, signInWithGoogle, loading: authLoading } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // ログイン済みならダッシュボード等へリダイレクト
  useEffect(() => {
    if (!authLoading && user) {
      router.push("/dashboard"); // 遷移先を適宜変更
    }
  }, [authLoading, user, router]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await signInWithEmail(email, password);
      // 成功したら onAuthStateChanged で backend verify が走る
    } catch (err: any) {
      setError(err.message ?? "ログインに失敗しました");
    } finally {
      setLoading(false);
    }
  };

  const onGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      setError(err.message ?? "Googleログインに失敗しました");
    } finally {
      setLoading(false);
    }
  };

  // ローディング中は LoginForm を表示したまま、props で反映
  return (
    <LoginForm
      email={email}
      onEmailChange={setEmail}
      password={password}
      onPasswordChange={setPassword}
      onSubmit={onSubmit}
      onGoogleSignIn={onGoogleSignIn}
      loading={loading || authLoading}
      error={error}
    />
  );
}
