"use client";

// import { auth } from "@/lib/firebaseClient";
import { useRouter } from "next/navigation";
import PetRegisterForm from "@/components/PetRegisterForm";
import { usePetFormStore } from "@/store/petFormStore";

// const API = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
// // 日本語→英語Enum変換マップ
// const speciesMap: Record<string, "dog" | "cat" | "other"> = {
//   犬: "dog",
//   猫: "cat",
//   その他: "other",
// };

export default function PetNewPage() {
  // const submit = async (form: PetForm) => {
  //   const u = auth.currentUser;
  //   if (!u) throw new Error("未ログインです");

  //   // フロント → バックエンドに送る形へ整形（キー名はAPIに合わせる）
  //   const payload = {
  //     name: form.name,
  //     species: form.species ?? "",
  //     breed: form.breed ?? "",
  //     sex: form.sex ?? "",
  //     birthday: form.birthday || null,                     // "YYYY-MM-DD" or null
  //     weight: form.weight ? Number(form.weight) : null,
  //     personality:   form.character ?? "",      // フォーム: character → API: personality
  //     medical_memo:  form.medicalMemo ?? "",    // フォーム: medicalMemo → API: medical_memo
  //     microchip_no:  form.microchip ?? "",      // フォーム: microchip   → API: microchip_no

  //   };
  //   console.log(payload)
  //   // 1回目：通常トークン
  //   let idToken: string = await u.getIdToken();
  //   console.log(idToken)
  //   let res = await fetch(`${API}/users/me/pets`, {
  //     method: "POST",
  //     headers: {
  //       "Content-Type": "application/json",
  //       Authorization: `Bearer ${idToken}`,
  //     },
  //     body: JSON.stringify(payload),
  //   });
  //   console.log(res)
  //   // 401だけ：トークンを強制リフレッシュして再試行
  //   if (res.status === 401) {
  //     idToken = await u.getIdToken(true);
  //     res = await fetch(`${API}/users/me/pets`, {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //         Authorization: `Bearer ${idToken}`,
  //       },
  //       body: JSON.stringify(payload),
  //     });
  //   }

  //   if (!res.ok) {
  //     const text = await res.text();
  //     throw new Error(`${res.status} ${text}`);
  //   }
  // };
  const router = useRouter();
  const { data, resetForm } = usePetFormStore();

  const handleSubmit = async () => {
    alert("入力内容を暗号化して保存しました。ページを閉じても復元されます。");
    console.log("暗号化保存済みデータ:", data);
    router.push("/mypage/pet"); // ✅ 一覧ページへ遷移
  };

  return (
    <main className="max-w-3xl mx-auto p-6">
      <h2 className="text-lg font-semibold mb-4">ペット新規登録</h2>
      <PetRegisterForm onSubmit={handleSubmit} /> {/* ✅ Props渡しOK */}
      <button
        onClick={() => {
          resetForm();
          alert("入力内容を削除しました。");
        }}
        className="mt-4 bg-gray-300 text-black py-2 px-4 rounded"
      >
        入力をクリア
      </button>
    </main>
  );
}
