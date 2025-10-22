"use client";
import { auth } from "@/lib/firebaseClient";
import PetRegisterForm, { PetForm } from "@/components/PetRegisterForm";
const API = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

export default function PetNewPage() {
  const submit = async (data: PetForm) => {
    const u = auth.currentUser;
    if (!u) throw new Error("未ログインです");
    const idToken = await u.getIdToken();
    const res = await fetch(`${API}/pets`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
  };

  return (
    <main className="max-w-3xl mx-auto p-6">
      <h2 className="text-lg font-semibold mb-4">ペット新規登録</h2>
      <PetRegisterForm onSubmit={submit} />
    </main>
  );
}
