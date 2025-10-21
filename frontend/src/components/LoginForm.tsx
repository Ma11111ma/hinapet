"use client";

import React, { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { auth, googleProvider } from "@/lib/firebaseClient";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { postSession } from "@/lib/apiClient";
import { LoginFormUI } from "./LoginFormUI";

const LoginForm: React.FC = () => {
  const router = useRouter();

  // state 定義
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // メールログイン
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const idToken = await userCredential.user.getIdToken();
      await postSession(idToken);
      console.log("✅ ログイン成功");

      // ログイン成功で /profileTabs に遷移
      router.push("/profileTabs");
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

  // Googleログイン
  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();
      await postSession(idToken);
      console.log("✅ Googleログイン成功");

      // ログイン成功で /profileTabs に遷移
      router.push("/profileTabs");
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

  return (
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
  );
};

export default LoginForm;
