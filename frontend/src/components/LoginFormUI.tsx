"use client";

import React, { FormEvent } from "react";

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

export const LoginFormUI: React.FC<Props> = ({
  email,
  password,
  onEmailChange,
  onPasswordChange,
  onSubmit,
  onGoogleSignIn,
  loading,
  error,
}) => {
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

      <button
        type="button"
        onClick={onGoogleSignIn}
        className="mt-2 bg-red-500 text-white py-2 rounded-md hover:bg-red-600"
      >
        Googleでログイン
      </button>
    </form>
  );
};
