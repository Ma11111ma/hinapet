"use client";
import React, { useState, FormEvent, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { LoginFormUI } from "@/components/LoginFormUI";
import { useAuth } from "@/features/auth/AuthProvider";

export default function LoginPage() {
  const { signInWithEmail, signInWithGoogle } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirected = searchParams.get("redirected") === "true";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(
    redirected ? "ログインしてください" : null
  );

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await signInWithEmail(email, password);
      router.replace("/profile");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "ログインに失敗しました");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      await signInWithGoogle();
      router.replace("/profile");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Googleログインに失敗しました");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex justify-center items-center min-h-screen bg-gray-50">
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
