// frontend/src/lib/apiClient.ts

export const postSession = async (idToken: string) => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  const res = await fetch(`${apiUrl}/auth/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken }),
  });

  if (!res.ok) {
    const text = await res.text(); // 👈 失敗時のレスポンスを出力
    console.error("❌ Auth verify failed:", text);
    throw new Error(`Failed to verify session: ${res.status}`);
  }

  return await res.json();
};
