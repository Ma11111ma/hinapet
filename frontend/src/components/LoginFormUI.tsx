// frontend/src/components/LoginFormUI.tsx
"use client";

import React, { FormEvent, useEffect, useState } from "react";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebaseClient";

type Props = {
  email: string;
  password: string;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  onSignUp?: () => void;
  onGoogleSignIn: () => void;
  loading: boolean;
  error: string | null;
};

export const LoginFormUI: React.FC<Props> = ({
  email,
  password,
  onEmailChange,
  onPasswordChange,
  onSubmit,
  onSignUp,
  onGoogleSignIn,
  loading,
  error,
}) => {
  // ✅ ログイン済みユーザーを保持
  const [currentEmail, setCurrentEmail] = useState<string | null>(null);
  const [checking, setChecking] = useState(true); // ← 初期チェック中フラグ

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && user.email) {
        setCurrentEmail(user.email);
      } else {
        setCurrentEmail(null);
      }
      setChecking(false);
    });

    return () => unsubscribe();
  }, []);

  // ✅ Firebaseの状態初期化中（ちらつき防止）
  if (checking) {
    return (
      <div className="p-6 bg-white rounded-xl shadow-md w-full max-w-md mx-auto text-center">
        <p className="text-gray-500">状態を確認中...</p>
      </div>
    );
  }
  // ログイン済みUI
  if (currentEmail) {
    return (
      <div className="p-6 bg-white rounded-xl shadow-md w-full max-w-md mx-auto text-center">
        <h2 className="text-lg font-bold mb-4 text-gray-800">
          ログイン中のユーザー
        </h2>
        <p className="text-gray-700 mb-6">{currentEmail}</p>
        <button
          onClick={() => signOut(auth)}
          className="bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600 transition"
        >
          ログアウト
        </button>
      </div>
    );
  }
  return (
    <form
      onSubmit={onSubmit}
      className="flex flex-col gap-4 p-6 bg-white rounded-xl shadow-md w-full max-w-md mx-auto"
    >
      <div>
        <label className="block text-sm font-medium text-gray-700">
          メールアドレス
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
          className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:border-blue-500 focus:ring focus:ring-blue-200"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          パスワード
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => onPasswordChange(e.target.value)}
          className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:border-blue-500 focus:ring focus:ring-blue-200"
          required
        />
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 disabled:opacity-50"
      >
        {loading ? "ログイン中..." : "ログイン"}
      </button>

      {onSignUp && (
        <button
          type="button"
          onClick={onSignUp}
          disabled={loading}
          className="bg-green-500 text-white py-2 rounded-md hover:bg-green-600 disabled:opacity-50"
        >
          {loading ? "登録中..." : "新規登録"}
        </button>
      )}

      <button
        type="button"
        onClick={onGoogleSignIn}
        className="mt-2 bg-red-500 text-white py-2 rounded-md hover:bg-red-600"
      >
        Googleでログイン
      </button>
      <button
        onClick={() => signOut(auth)}
        className="bg-gray-400 text-white py-2 px-4 rounded-md hover:bg-gray-500"
      >
        ログアウト
      </button>
    </form>
  );
};
