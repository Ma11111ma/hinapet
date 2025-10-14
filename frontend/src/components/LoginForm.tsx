import React, { useState } from "react";
import { LoginForm } from "./LoginFormUI"; // ← 修正済み
import { auth, googleProvider } from "../lib/firebaseClient";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { postSession } from "../lib/apiClient";

const LoginFormContainer: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const idToken = await userCredential.user.getIdToken();
      await postSession(idToken);
      // ログイン成功後の処理（例: ページ遷移）
    } catch (err: any) {
      setError(err.message || "ログインに失敗しました");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();
      await postSession(idToken);
      // ログイン成功後の処理
    } catch (err: any) {
      setError(err.message || "Googleログインに失敗しました");
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
      onSubmit={handleSubmit}
      onGoogleSignIn={handleGoogleSignIn}
      loading={loading}
      error={error}
    />
  );
};

export default LoginFormContainer;
