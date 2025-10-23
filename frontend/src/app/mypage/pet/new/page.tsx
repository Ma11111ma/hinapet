"use client";

import { auth } from "@/lib/firebaseClient";
import PetRegisterForm, { PetForm } from "@/components/PetRegisterForm";

const API = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

export default function PetNewPage() {
  const submit = async (form: PetForm) => {
    const u = auth.currentUser;
    if (!u) throw new Error("未ログインです");

    // フロント → バックエンドに送る形へ整形（キー名はAPIに合わせる）
    const payload = {
      name: form.name,
      species: form.species ?? "",
      breed: form.breed ?? "",
      sex: form.sex ?? "",
      birthday: form.birthday || null,                     // "YYYY-MM-DD" or null
      weight: form.weight ? Number(form.weight) : null,
      personality:   form.character ?? "",      // フォーム: character → API: personality
      medical_memo:  form.medicalMemo ?? "",    // フォーム: medicalMemo → API: medical_memo
      microchip_no:  form.microchip ?? "",      // フォーム: microchip   → API: microchip_no

    };
    console.log(payload)
    // 1回目：通常トークン
    let idToken: string = await u.getIdToken();
    console.log(idToken)
    let res = await fetch(`${API}/users/me/pets`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify(payload),
    });
    console.log(res)
    // 401だけ：トークンを強制リフレッシュして再試行
    if (res.status === 401) {
      idToken = await u.getIdToken(true);
      res = await fetch(`${API}/users/me/pets`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify(payload),
      });
    }

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`${res.status} ${text}`);
    }
  };

  return (
    <main className="max-w-3xl mx-auto p-6">
      <h2 className="text-lg font-semibold mb-4">ペット新規登録</h2>
      <PetRegisterForm onSubmit={submit} />
    </main>
  );
}
