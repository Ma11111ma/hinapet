"use client";
// pages/login.tsx ページ結合
import React, { useState } from "react";
import { LoginForm } from "@/components/LoginFormUI"; // ← 修正: LoginFormUI から import
import { useAuth } from "@/features/auth/useAuth";

export default function LoginPage() {
  const { signInWithEmail, signInWithGoogle } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await signInWithEmail(email, password);
      // 成功したら onAuthStateChanged の flow で backend への verify が発生
      // router.push("/") など遷移
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

  return (
    <LoginForm
      email={email}
      onEmailChange={setEmail}
      password={password}
      onPasswordChange={setPassword}
      onSubmit={onSubmit}
      onGoogleSignIn={onGoogleSignIn}
      loading={loading}
      error={error}
    />
  );
}
