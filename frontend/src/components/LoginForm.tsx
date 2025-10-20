"use client";
import React, { useState } from "react";
import { LoginFormUI } from "./LoginFormUI"; // ← 修正済み
import { auth, googleProvider } from "../lib/firebaseClient";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { FirebaseError } from "firebase/app";
import { postSession } from "../lib/apiClient";

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignUp = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1) まず Firebase でユーザー作成（ここが真の「新規登録」）
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      const idToken = await cred.user.getIdToken();

      console.log("✅ Firebase sign-up OK:", cred.user.email);

      // 2) 次にバックエンド検証（失敗しても「登録自体は成功」として扱う）
      try {
        await postSession(idToken); // /auth/verify に POST
        console.log("✅ /auth/verify OK");
      } catch (e) {
        console.warn("⚠️ /auth/verify failed (登録は成功しています)", e);
        // UIには「登録は成功、サーバー検証は未了」と出す
        setError(
          "登録は成功しましたが、サーバー検証に失敗しました。後ほど再試行してください。"
        );
      }
    } catch (e: unknown) {
      // ここに来た場合のみ「登録失敗」
      if (e instanceof FirebaseError) {
        switch (e.code) {
          case "auth/email-already-in-use":
            setError(
              "このメールは既に登録されています。ログインしてください。"
            );
            break;
          case "auth/invalid-email":
            setError("メールアドレスの形式が不正です。");
            break;
          case "auth/weak-password":
            setError("パスワードは6文字以上にしてください。");
            break;
          default:
            setError(`登録エラー: ${e.message}`);
        }
      } else {
        setError("新規登録に失敗しました");
      }
    } finally {
      setLoading(false);
    }
  };

  // メールアドレスでログイン
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
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
      onSignUp={handleSignUp}
      onGoogleSignIn={handleGoogleSignIn}
      loading={loading}
      error={error}
    />
  );
};

export default LoginForm;
