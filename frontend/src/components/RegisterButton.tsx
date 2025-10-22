"use client";

import React, { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebaseClient";
import { postSession } from "@/lib/apiClient";
import { useRouter } from "next/navigation";

type Props = {
  email: string;
  password: string;
  redirectPath?: string; // ✅ 成功時の遷移先（省略時は /profileTabs）
};

export const RegisterButton: React.FC<Props> = ({
  email,
  password,
  redirectPath = "/profileTabs",
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleRegister = async () => {
    setError(null);
    setLoading(true);
    try {
      // Firebase で新規ユーザー作成
      const result = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const idToken = await result.user.getIdToken();

      // FastAPI 側でトークン検証
      await postSession(idToken);
      console.log("✅ 新規登録成功＆トークン発行:", idToken);

      router.push(redirectPath);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "登録に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center mt-2">
      <button
        type="button"
        onClick={handleRegister}
        disabled={loading}
        className="bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 disabled:opacity-50"
      >
        {loading ? "登録中..." : "新規登録"}
      </button>
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
    </div>
  );
};
