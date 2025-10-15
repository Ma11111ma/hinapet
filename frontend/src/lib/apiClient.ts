// frontend/src/lib/apiClient.ts
import { LoginResponse } from "../types/api";

export async function postSession(idToken: string): Promise<LoginResponse> {
  const res = await fetch("/api/auth/verify", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ idToken }),
  });

  if (!res.ok) {
    throw new Error("Failed to verify session");
  }

  return (await res.json()) as LoginResponse;
}
