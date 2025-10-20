"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/AuthProvider";

export default function ProfilePage() {
const { user, loading } = useAuth();
const router = useRouter();

useEffect(() => {
if (!loading && !user) {
router.replace("/login"); // ✅ 未ログインならログインページへ
}
}, [loading, user, router]);

if (loading) {
return ( <div className="flex justify-center items-center min-h-screen"> <p className="text-gray-600 text-lg">読み込み中です...</p> </div>
);
}

if (!user) {
return ( <div className="flex justify-center items-center min-h-screen"> <p className="text-red-600 text-lg font-medium">
ログインしてください </p> </div>
);
}

return ( <div className="flex flex-col justify-center items-center min-h-screen"> <h1 className="text-2xl font-bold mb-6">プロフィール情報</h1> <div className="bg-white shadow-md rounded-lg p-6 w-80 border"> <p className="mb-2"> <span className="font-semibold">メールアドレス：</span> {user.email ?? "未設定"} </p> <p className="mb-2"> <span className="font-semibold">名前：</span> {user.displayName ?? "未設定"} </p> </div> </div>
);
}
