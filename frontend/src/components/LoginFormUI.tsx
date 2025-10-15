// frontend/src/components/LoginFormUI.tsx
"use client";

import React, { Dispatch, SetStateAction, FormEvent } from "react";

type Props = {
  email: string;
  password: string;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  onGoogleSignIn: () => void;
  loading: boolean;
  error: string | null;
};

export default function LoginFormUI({
  email,
  password,
  onEmailChange,
  onPasswordChange,
  onSubmit,
  onGoogleSignIn,
  loading,
  error,
}: Props) {
  return (
    <form
      onSubmit={onSubmit}
      className="w-full max-w-sm p-6 bg-white rounded-lg shadow-md flex flex-col gap-4"
    >
      <h2 className="text-2xl font-bold text-center">ログイン</h2>

      {error && (
        <div className="text-red-500 text-sm text-center">{error}</div>
      )}

      {/* Email入力 */}
      <div className="flex flex-col">
        <label htmlFor="email" className="mb-1 text-sm font-medium">
          メールアドレス
        </label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
          className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      {/* Password入力 */}
      <div className="flex flex-col">
        <label htmlFor="password" className="mb-1 text-sm font-medium">
          パスワード
        </label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => onPasswordChange(e.target.value)}
          className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      {/* Submitボタン */}
      <button
        type="submit"
        disabled={loading}
        className={`w-full py-2 rounded text-white font-semibold ${
          loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"
        }`}
      >
        {loading ? "ログイン中..." : "ログイン"}
      </button>

      {/* Googleログイン */}
      <button
        type="button"
        onClick={onGoogleSignIn}
        disabled={loading}
        className={`w-full py-2 rounded text-white font-semibold mt-2 ${
          loading ? "bg-gray-400 cursor-not-allowed" : "bg-red-500 hover:bg-red-600"
        }`}
      >
        {loading ? "処理中..." : "Googleでログイン"}
      </button>
    </form>
  );
}
