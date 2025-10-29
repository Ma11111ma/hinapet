// frontend/src/app/register/page.tsx
"use client";
import { useState } from "react";
import { RegisterButton } from "@/components/RegisterButton";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="min-h-screen bg-amber-50 flex justify-center items-start pt-20 pb-24">
      {/* 中央の登録フォームボックス */}
      <div className="p-6 w-full max-w-md rounded-xl">
        <h1 className="text-xl font-bold mb-4">新規登録</h1>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border border-amber-300 bg-white rounded-md w-full p-2 mb-2"
          placeholder="メールアドレス"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border border-amber-300 bg-white rounded-md w-full p-2 mb-4"
          placeholder="パスワード"
        />
        <RegisterButton email={email} password={password} />
      </div>
    </div>
  );
}
