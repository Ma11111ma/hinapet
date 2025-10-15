"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import LoginForm from "@/components/LoginFormUI";
import { useAuth } from "@/features/auth/useAuth";

export default function LoginPage() {
  const router = useRouter();
  const { signInWithEmail, signInWithGoogle, loading: authLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await signInWithEmail(email, password);
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "ログインに失敗しました");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      await signInWithGoogle();
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Googleログインに失敗しました");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex justify-center items-center min-h-screen bg-gray-50">
      <LoginForm
        email={email}
        password={password}
        onEmailChange={setEmail}
        onPasswordChange={setPassword}
        onSubmit={handleSubmit}
        onGoogleSignIn={handleGoogleSignIn}
        loading={loading || authLoading}
        error={error}
      />
    </main>
  );
}
