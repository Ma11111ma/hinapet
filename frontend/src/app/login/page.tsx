"use client";

import React, { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { LoginFormUI } from "@/components/LoginFormUI";
import { useAuth } from "@/features/auth/AuthProvider";
import { auth } from "@/lib/firebaseClient";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";

export default function LoginPage() {
const { signInWithEmail } = useAuth();
const router = useRouter();

const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);

// メール + パスワードログイン処理
const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
e.preventDefault();
setError(null);
setLoading(true);
try {
const result = await signInWithEmail(email, password);
if (result?.user) {
router.replace("/profile");
} else {
setError("メールアドレスまたはパスワードが正しくありません。");
}
} catch (err: unknown) {
console.error(err);
setError(err instanceof Error ? err.message : "ログインに失敗しました");
} finally {
setLoading(false);
}
};

// ✅ Googleログイン（直接 signInWithPopup 呼び出し）
const handleGoogleSignIn = async () => {
setError(null);
setLoading(true);
try {
const provider = new GoogleAuthProvider();
const result = await signInWithPopup(auth, provider);
if (result.user) {
router.replace("/profile");
} else {
setError("Google認証に失敗しました。");
}
} catch (err: unknown) {
console.error(err);
setError(err instanceof Error ? err.message : "Googleログインに失敗しました");
} finally {
setLoading(false);
}
};

return ( <main className="flex justify-center items-center min-h-screen bg-gray-50"> <LoginFormUI
     email={email}
     password={password}
     onEmailChange={setEmail}
     onPasswordChange={setPassword}
     onSubmit={handleSubmit}
     onGoogleSignIn={handleGoogleSignIn}
     loading={loading}
     error={error}
   /> </main>
);
}
